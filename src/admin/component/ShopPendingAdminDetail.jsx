import React, { useState, useEffect } from "react";
import Adminlist from "../section/Adminlist";
import { Box, Stack, TextField, Button, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers";
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { postcodeScriptUrl } from "react-daum-postcode/lib/loadPostcode";

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function ShopPendingAdminDetail() {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const [shopInfo, setShopInfo] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [is24Hours, setIs24Hours] = useState(false);
    const [zipcode, setZipcode] = useState(null);
    const [address, setAddress] = useState(null);
    const [regionId, setRegionId] = useState(null);
    const [isImageBroken, setIsImageBroken] = useState(false);

    const open = useDaumPostcodePopup(postcodeScriptUrl);
    const handleComplete = (data) => {
        if (data.addressType === 'R') {
            console.log(data);
            setAddress(data.roadAddress);
            setZipcode(data.zonecode);
            setRegionId(data.sigunguCode);
        }
    }
    const handleSearch = () => {
        open({ onComplete: handleComplete });
    }

    useEffect(() => {
        const fetchData = async () => {
            let result = await fetch(`${backend}/api/v1/shop-pending/${shopId}`);
            if (result.status === 404) {
                alert('존재하지 않는 가게입니다');
                navigate(-1);
                return;
            }
            let json = await result.json();
            console.log(json.status);
            setShopInfo(json);
        }
        fetchData();
    }, [shopId, navigate])

    const handle24HoursChange = (event) => {
        setIs24Hours(event.target.checked);
    };

    const onFormChange = (e) => {
        setShopInfo({ ...shopInfo, [e.target.name]: e.target.value });
    }

    const handleImageError = () => {
        setIsImageBroken(true);
    };

    const accept = async () => {
        const businessHours = is24Hours ? "24시간" : `${startTime?.format('HH:mm')} - ${endTime?.format('HH:mm')}`;
        const requestBody = {
            id: shopId,
            newAddress: address,
            zipcode: zipcode,
            phone: shopInfo.phone,
            boast: shopInfo.boast,
            businessHours: businessHours,
            info: shopInfo.info,
            memo: shopInfo.memo
        };

        try {
            const response = await fetch(`${backend}/api/v1/shop-pending/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                alert('가게가 성공적으로 등록되었습니다.');
                navigate('/admin/shops');
            } else {
                alert('가게 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('가게 등록 중 오류가 발생했습니다.');
        }
    };

    const reject = async () => {
        const requestBody = {
            id: shopId,
            reason: shopInfo.rejectReason // Assuming you have a field for reject reason
        };

        try {
            const response = await fetch(`${backend}/api/v1/shop-pending/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                alert('가게가 성공적으로 반려되었습니다.');
                navigate('/shop-pending-manage');
            } else {
                alert('가게 반려에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('가게 반려 중 오류가 발생했습니다.');
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "row", padding: 3 }}>
            <Adminlist />
            <Box sx={{ flexGrow: 1, paddingLeft: 3 }}>
                {shopInfo && (
                    <Stack
                        component="form"
                        spacing={3}
                        autoComplete="off"
                        sx={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
                    >
                        <Typography variant="h4" component="h2" gutterBottom>
                            등록 보류된 가게 정보 수정
                        </Typography>

                        <TextField
                            disabled
                            label="상호명"
                            value={shopInfo.name}
                            variant="outlined"
                            fullWidth
                        />
                        <TextField
                            name="phone"
                            label="연락처"
                            multiline
                            variant="outlined"
                            value={shopInfo.phone}
                            onChange={onFormChange}
                            fullWidth
                        />
                        <TextField
                            id="previousAddress"
                            label="기존 가게 주소"
                            placeholder="기존 가게 주소"
                            inputProps={{ readOnly: true, disableUnderline: true }}
                            multiline
                            value={shopInfo.address}
                            variant="standard"
                            fullWidth
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                id="postcode"
                                placeholder="우편번호"
                                multiline
                                inputProps={{ readOnly: true, disableUnderline: true }}
                                value={zipcode}
                                variant="standard"
                                sx={{ flex: 1 }}
                            />
                            <Button
                                onClick={handleSearch}
                                variant="contained"
                                sx={{
                                    bgcolor: 'black',
                                    color: 'white',
                                    ":hover": {
                                        bgcolor: "gray"
                                    }
                                }}
                            >
                                주소 찾기
                            </Button>
                        </Box>
                        <TextField
                            id="detailAddress"
                            placeholder="변경된 가게 주소"
                            inputProps={{ readOnly: true, disableUnderline: true }}
                            multiline
                            value={address}
                            variant="standard"
                            fullWidth
                        />
                        <TextField
                            name="boast"
                            label="자랑거리"
                            multiline
                            variant="outlined"
                            value={shopInfo.boast}
                            onChange={onFormChange}
                            fullWidth
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker', 'TimePicker']}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TimePicker
                                        label="시작시간"
                                        value={startTime}
                                        onChange={newValue => setStartTime(newValue)}
                                        sx={{ flex: 1 }}
                                        disabled={is24Hours}
                                    />
                                    <TimePicker
                                        label="종료시간"
                                        value={endTime}
                                        onChange={newValue => setEndTime(newValue)}
                                        sx={{ flex: 1 }}
                                        disabled={is24Hours}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={is24Hours}
                                                onChange={handle24HoursChange}
                                            />
                                        }
                                        label="24시간"
                                    />
                                </Stack>
                            </DemoContainer>
                        </LocalizationProvider>
                        <TextField
                            name="info"
                            label="기타정보"
                            multiline
                            variant="outlined"
                            value={shopInfo.info}
                            onChange={onFormChange}
                            fullWidth
                        />
                        <TextField
                            disabled
                            name="errorInfo"
                            label="오류 정보"
                            multiline
                            variant="outlined"
                            value={shopInfo.errorInfo}
                            onChange={onFormChange}
                            fullWidth
                        />
                        <TextField
                            name="memo"
                            label="메모"
                            multiline
                            value={shopInfo.memo}
                            variant="outlined"
                            onChange={onFormChange}
                            fullWidth
                        />
                        {shopInfo.imgUrlPublic && ( // 이미지 URL이 있는 경우에만 미리보기 표시
                            <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', width: '300px', height: '300px', margin: '0 auto' }}>
                                {isImageBroken ? (
                                    <Typography variant="h6" align="center" sx={{ lineHeight: '300px' }}>
                                        이미지가 없습니다
                                    </Typography>
                                ) : (
                                    <img
                                        style={{
                                            width: '300px',
                                            height: '300px',
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                        src={shopInfo.imgUrlPublic}
                                        alt="상점이미지"
                                        onError={handleImageError}
                                    />
                                )}
                            </Box>
                        )}

                        <Typography variant="h6" component="p">
                            상태: {shopInfo.status}
                        </Typography>

                        <Stack direction="row-reverse" gap={2}>
                            {shopInfo.status === 'PENDING' && (
                                <>
                                    <Button variant="contained" color="warning" onClick={reject}>등록 반려</Button>
                                    <Button variant="contained" onClick={accept}>수정 및 등록</Button>
                                </>
                            )}
                            {shopInfo.status === 'REJECTED' && (
                                <Button variant="contained" onClick={accept}>수정 및 등록</Button>
                            )}
                            {shopInfo.status === 'ACCEPTED' && (
                                <Button variant="contained" onClick={() => navigate(`/shopAdminDetail/${shopId}`)}>가게 관리로 이동</Button>
                            )}
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

