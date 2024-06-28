import React, { useState, useEffect, useRef } from "react";
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import {
    Card, CardActions, CardContent, Button, Typography, List, ListItem, ListItemText,
    Chip, Container, ImageList, Paper, Rating, Tab, Tabs, Box, IconButton, Snackbar, Alert
} from '@mui/material';
import Carousel from "react-material-ui-carousel";
import { Link, useNavigate, useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import ProductInfo from "./ProductInfo";
import ReviewSummary from "./ReviewSummary";
import ShopNewsDrawer from "./ShopNewsDrawer";

const backend = process.env.REACT_APP_BACKEND_ADDR;

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`panel-${index}`}
            {...other}>
            {value === index && (
                <Box sx={{ pt: 2 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    )
};

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function ShopDetail() {
    const defaultImage = '/images/default_storeImage.png';
    const navigate = useNavigate();
    const [datas, setDatas] = useState(null);
    const [productDatas, setProductDatas] = useState(null);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [value, setValue] = React.useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [hasRecommended, setHasRecommended] = useState(false);
    const [hasMarked, setHasMarked] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [stations, setStations] = useState(null);
    const [shopNewsDatas, setShopNewsDatas] = useState([]);
    const [hasMoreData, setHasMoreData] = useState(true);
    const atk = sessionStorage.getItem('atk');
    const { Kakao } = window;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';

    useEffect(() => {
        Kakao.cleanup();
        Kakao.init('26629afca566a85d39b41a0e7760267d');
    }, []);

    const shareKakao = (datas) => {
        if (Kakao.isInitialized()) {
            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${datas.shopName}`,
                    description: `${datas.address}`,
                    imageUrl: `${datas.shopImgUrls[0]}`,
                    link: {
                        mobileWebUrl: `https://good-companion.shop/detail/${datas.shopId}`,
                    },
                },
                buttons: [
                    {
                        title: '상세보기',
                        link: {
                            mobileWebUrl: `https://good-companion.shop/detail/${datas.shopId}`,
                        },
                    },
                ],
            });
        } else {
            alert('카카오톡이 설치되어 있지 않습니다.');
        }
    }
    const handleChange = (event, newValue) => {
        /*3,4번 인덱스인 소식 관리 버튼을 눌렀을 경우 탭 전환 방지*/
        if (newValue === 3) {
            setDrawerOpen(true);
            return;
        } else if (newValue === 4) {
            navigate(`/shopAdminDetail/${shopId}`);
            return;
        }
        setValue(newValue);
    };
    const { shopId } = useParams();
    const [state, setState] = useState({
        center: {
            lat: 37.5029087190,
            lng: 127.0377563750,
        },
        errMsg: null,
        isLoading: true,

    });

    useEffect(() => {
        if (latitude)
            fetch(`${backend}/api/v1/subway/?latitude=${latitude}&longitude=${longitude}`)
                .then(response => response.json())
                .then(json => { setStations(json) });
    }, [latitude]);

    useEffect(() => {
        const atk = sessionStorage.getItem('atk');
        if (atk !== null) {
            fetch(`${backend}/api/v1/shopRecommend/check?shopId=${shopId}`, {
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("atk")
                }
            }).then(response => response.json())
                .then(json => setHasRecommended(json));

            fetch(`${backend}/api/v1/shopmark/check?shopId=${shopId}`, {
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem("atk")
                }
            }).then(response => response.json())
                .then(json => setHasMarked(json));
        }


        const fetchData = async () => {
            try {
                let result = await fetch(`${backend}/api/v1/shop/${shopId}`);
                if (result.status === 200) {
                    const json = await result.json();
                    setDatas(json);

                    if (json.businessHours != null && json.businessHours.length >= 5) {
                        const [start, end] = json.businessHours.split(' - ').map(time => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const date = new Date();
                            date.setHours(hours, minutes, 0, 0);
                            return date;
                        });
                        const now = new Date();
                        const isOpen = (now >= start && now <= end) || (start > end && (now >= start || now <= end));
                        setIsOpen(isOpen);
                    }
                } else if (result.status === 404) {
                    alert("존재하지 않는 가게입니다");
                    navigate(-1);
                    return;
                }

                result = await fetch(`${backend}/api/v1/shopLocation/${shopId}`);
                let json = await result.json();
                setLatitude(json.latitude);
                setLongitude(json.longitude);
                setState({
                    center: {
                        lat: json.latitude,
                        lng: json.longitude
                    }
                });

                result = await fetch(`${backend}/api/v1/product/?shopId=${shopId}`);
                json = await result.json();
                setProductDatas(json);

                result = await fetch(`${backend}/api/v1/review/summary?shopId=${shopId}`);
                json = await result.json();
                setReviewSummary(json);

                result = await fetch(`${backend}/api/v1/shop-news/${shopId}`)
                json = await result.json();
                setShopNewsDatas(json.newsList);
                setHasMoreData(json.newsList.length > 0);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [shopId, navigate]);

    const [level, setLevel] = useState(5);
    const mapRef = useRef();

    function recommend() {
        fetch(`${backend}/api/v1/shopRecommend/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8;',
                'Authorization': 'Bearer ' + sessionStorage.getItem("atk")
            },
            body: JSON.stringify({
                shopId: shopId
            })
        }).then(response => {
            if (response.status === 200) {
                setHasRecommended(true);
                setSnackbarMessage('추천되었습니다.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('추천에 실패했습니다.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        });
    }

    function unRecommend() {
        fetch(`${backend}/api/v1/shopRecommend/remove`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json; charset=utf-8;',
                'Authorization': 'Bearer ' + sessionStorage.getItem("atk")
            },
            body: JSON.stringify({
                shopId: shopId
            })
        }).then(response => {
            if (response.status === 200) {
                setHasRecommended(false);
                setSnackbarMessage('추천이 해제되었습니다.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('추천 해제에 실패했습니다.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        });
    }

    function addShopMark() {
        fetch(`${backend}/api/v1/shopmark/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem('atk')
            },
            body: JSON.stringify({ shopId: shopId })
        }).then(response => {
            if (response.status === 201) {
                setHasMarked(true);
                setSnackbarMessage('즐겨찾기에 추가되었습니다.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('즐겨찾기 추가에 실패했습니다.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        });
    }

    function deleteShopMark() {
        fetch(`${backend}/api/v1/shopmark/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem('atk')
            },
            body: JSON.stringify({ shopId: shopId })
        }).then(response => {
            if (response.status === 200) {
                setHasMarked(false);
                setSnackbarMessage('즐겨찾기에서 제거되었습니다.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage('즐겨찾기 제거에 실패했습니다.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        });
    }

    const fetchMoreData = async () => {
        try {
            const result = await fetch(`${backend}/api/v1/shop-news/${shopId}?page=${page}`);
            const json = await result.json();
            if (json.newsList.length > 0) {
                setShopNewsDatas(prev => [...prev, ...json.newsList]);
                setPage(prev => prev + 1);
            } else {
                setHasMoreData(false);
            }
        } catch (error) {
            console.error('Failed to fetch more data:', error);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '80px' }}>
            <div>
                {datas && datas.isAvailable === 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        지정해제된 가게입니다. 일부 데이터가 부정확할 수 있습니다.
                    </Alert>
                )}
                {datas && <Card sx={{ width: '100%' }}>
                    <Carousel autoPlay={false} animation="slide" timeout={1000} >
                        {datas.shopImgUrls.length > 0 ? datas.shopImgUrls.map(url =>
                            <Paper key={url}>
                                <div style={{ width: '100%', paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
                                    <img
                                        src={url || defaultImage}
                                        alt="상점 이미지"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultImage;
                                        }}
                                    />
                                </div>
                            </Paper>
                        ) : (
                            <Paper>
                                <div style={{ width: '100%', paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
                                    <img
                                        src={defaultImage}
                                        alt="상점 이미지"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            display: 'block'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultImage;
                                        }}
                                    />
                                </div>
                            </Paper>
                        )}
                    </Carousel>
                    <CardContent sx={{ padding: '16px' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '8px' }}>
                            <Typography gutterBottom variant="h5" component="div">
                                {datas.shopName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {datas.sector}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="baseline" sx={{ marginBottom: '8px' }}>
                            <img src="https://img.icons8.com/fluency/48/thumb-up.png" width={25} height={25} alt="recommendation icon" />
                            <Typography variant="body2" color="text.secondary" style={{ marginLeft: 4 }}>
                                {datas.recommend}
                            </Typography>
                        </Box>
                        <Rating readOnly value={datas.rate} precision={0.1} /> {datas.rate.toFixed(2)}
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ padding: '0px' }}
                        >
                            <Tab label="홈" />
                            <Tab label="지도" />
                            <Tab label="기타 정보" />
                            <Tab label="소식" />
                            {isAdmin && <Tab label="가게 관리" />}
                        </Tabs>
                        <CustomTabPanel value={value} index={0}>
                            <Typography>주소</Typography>
                            <Typography variant="body2" color="text.secondary">{datas.address}</Typography>
                            <Typography>연락처</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {datas.phone.length < 5 ? "연락처 정보가 없습니다" : (<a href={`tel:${datas.phone}`}>{datas.phone}</a>)}
                            </Typography>
                            <Typography>영업시간</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {datas.businessHours && datas.businessHours.length < 5 ? "영업시간 정보가 없습니다." : datas.businessHours} <br />(자세한 시간 정보는 기타 정보를 참고하세요.)
                            </Typography>
                            <Typography variant="body2" color={isOpen ? "green" : "red"}>
                                {datas.businessHours && datas.businessHours.length >= 5 && isOpen ? "영업중입니다" : (datas.businessHours && "영업중이 아닙니다")}
                            </Typography>
                            <br />
                            {datas.isLocalFranchise == 1 && (<Chip label="서울사랑상품권" variant="outlined" color="primary" />)}
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <div style={{ width: '100%', position: 'relative', paddingTop: '100%' }}>
                                <Map
                                    center={state.center}
                                    isPanto={state.isPanto}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    level={level}
                                    ref={mapRef}
                                >
                                    {!state.isLoading && (
                                        <MapMarker position={state.center}>
                                            <div style={{ width: "150px", color: "#000", textAlign: "center" }}>
                                                {state.errMsg ? state.errMsg : datas && datas.shopName}
                                            </div>
                                        </MapMarker>
                                    )}
                                </Map>
                            </div>
                            {stations && stations.length > 0 && (() => {
                                const stationGroups = stations.reduce((acc, station) => {
                                    if (!acc[station.name]) {
                                        acc[station.name] = { lines: [], distances: [] };
                                    }
                                    if (!acc[station.name].lines.includes(station.line)) {
                                        acc[station.name].lines.push(station.line);
                                    }
                                    acc[station.name].distances.push(station.distance * 1000);
                                    return acc;
                                }, {});

                                const stationAverages = Object.keys(stationGroups).map(name => {
                                    const totalDistance = stationGroups[name].distances.reduce((acc, distance) => acc + distance, 0);
                                    const averageDistance = totalDistance / stationGroups[name].distances.length;
                                    const lines = stationGroups[name].lines.join(',');
                                    return { name, lines, averageDistance: Math.round(averageDistance) };
                                });

                                return stationAverages.map((station, index) => (
                                    <p key={index}>{station.name}역({station.lines})에서 {station.averageDistance}m</p>
                                ));
                            })()}
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            <Typography>기타 정보</Typography>
                            <Typography variant="body2" color="text.secondary">{datas.info}</Typography>
                            <Typography>자랑거리</Typography>
                            <Typography variant="body2" color="text.secondary">{datas.boast}</Typography>
                        </CustomTabPanel>
                    </CardContent>
                    <CardActions sx={{ padding: '8px' }}>
                        <Button size="small" onClick={hasRecommended ? unRecommend : recommend} disabled={atk === null}>{hasRecommended ? "추천 해제" : "추천"}</Button>
                        <Button size="small" onClick={hasMarked ? deleteShopMark : addShopMark} disabled={atk === null} >{hasMarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}</Button>
                        <Button size="small" onClick={() => { shareKakao(datas) }}>공유하기</Button>
                    </CardActions>
                </Card>
                }
            </div>
            <ProductInfo productDatas={productDatas} />
            <ReviewSummary reviewSummary={reviewSummary} shopId={shopId} />

            <ShopNewsDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
                shopNewsDatas={shopNewsDatas}
                fetchMoreData={fetchMoreData}
                hasMoreData={hasMoreData}
            />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default ShopDetail;
