import React, { useState, useEffect } from "react";
import Adminlist from "../section/Adminlist";
import { Box, Stack, TextField, Button, FormControlLabel, Checkbox, Select, MenuItem, InputLabel, FormControl, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function ProposalAdminDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [shopInfo, setShopInfo] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [is24Hours, setIs24Hours] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState("");
    const [boast, setBoast] = useState("");
    const [isLocalFranchise, setIsLocalFranchise] = useState(0);

    useEffect(() => {
        const fetchSector = fetch(`${backend}/api/v1/sector/`).then(response => response.json());
        const fetchData = fetch(`${backend}/api/v1/proposal/${id}`).then(response => {
            if (response.status === 404) {
                alert('존재하지 않는 요청입니다');
                navigate(-1);
                return null;
            }
            return response.json();
        });

        Promise.all([fetchSector, fetchData]).then(([sectorsData, shopData]) => {
            if (shopData) {
                setShopInfo(shopData);
                initializeBusinessHours(shopData.businessHours);
                setSelectedSector(shopData.sectorId);
                setIsLocalFranchise(shopData.isLocalFranchise ? 1 : 0);
            }
            setSectors(sectorsData);
        });
    }, [id, navigate]);

    const initializeBusinessHours = (businessHours) => {
        if (businessHours === "00:00 - 24:00") {
            setIs24Hours(true);
        } else if (businessHours) {
            const [start, end] = businessHours.split('-');
            setStartTime(dayjs().hour(Number(start.split(':')[0])).minute(Number(start.split(':')[1])));
            setEndTime(dayjs().hour(Number(end.split(':')[0])).minute(Number(end.split(':')[1])));
        }
    };

    const navigateToMainadmin = () => {
        navigate("/Mainadmin");
    };

    const handleProposalAction = (action) => {
        const businessHours = is24Hours ? `00:00 - 24:00` : `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`;
        const updatedShopInfo = {
            id: shopInfo.id,
            shopPhone: shopInfo.shopPhone,
            info: shopInfo.info,
            businessHours: businessHours,
            boast: boast,
            memo: shopInfo.memo,
            isLocalFranchise: isLocalFranchise
        };

        let url;
        let body;

        if (action === "approve") {
            url = `${backend}/api/v1/proposal/approval`;
            body = JSON.stringify(updatedShopInfo);
        } else if (action === "approveUnregistered") {
            url = `${backend}/api/v1/proposal/approval-unregistered`;
            body = JSON.stringify(updatedShopInfo);
        } else {
            url = `${backend}/api/v1/proposal/reject`;
            body = JSON.stringify({ id: shopInfo.id, memo: shopInfo.memo });
        }

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        })
            .then(response => {
                if (response.status === 200) {
                    alert(action === "approve" ? '승인 완료' : action === "approveUnregistered" ? '승인(미등록) 완료' : '반려 완료');
                } else {
                    alert(action === "approve" ? '승인 실패' : action === "approveUnregistered" ? '승인(미등록) 실패' : '반려 실패');
                }
            });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Adminlist />
            <hr />
            {shopInfo && (
                <Stack
                    component="form"
                    spacing={3}
                    autoComplete="off"
                    width="70%"
                    justifyContent="center"
                    margin={5}
                    ml={10}
                >
                    <Typography variant="body1">
                        등록 요청자: {shopInfo.memberNickname} ({shopInfo.memberEmail})
                    </Typography>
                    <TextField
                        InputProps={{ readOnly: true }}
                        label="상호명"
                        variant="outlined"
                        value={shopInfo.shopName}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel id="sector-label">업종</InputLabel>
                        <Select
                            labelId="sector-label"
                            id="sector-select"
                            value={selectedSector}
                            label="업종"
                            onChange={(e) => setSelectedSector(e.target.value)}
                        >
                            {sectors.map((sector) => (
                                <MenuItem key={sector.id} value={sector.id}>
                                    {sector.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="연락처"
                        multiline
                        variant="outlined"
                        value={shopInfo.shopPhone}
                        onChange={(e) => setShopInfo({ ...shopInfo, shopPhone: e.target.value })}
                    />
                    <TextField
                        label="주소"
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        value={shopInfo.shopAddress}
                    />
                    <TextField
                        label="우편번호"
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        value={shopInfo.zipcode}
                    />
                    <TextField
                        label="기타정보"
                        multiline
                        variant="outlined"
                        value={shopInfo.info}
                        onChange={(e) => setShopInfo({ ...shopInfo, info: e.target.value })}
                    />
                    <TextField
                        label="자랑거리"
                        multiline
                        variant="outlined"
                        value={boast}
                        onChange={(e) => setBoast(e.target.value)}
                    />
                    <TextField
                        label="처리내용"
                        multiline
                        variant="outlined"
                        value={shopInfo.memo}
                        onChange={(e) => setShopInfo({ ...shopInfo, memo: e.target.value })}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TimePicker
                                label="시작시간"
                                value={startTime}
                                disabled={is24Hours}
                                onChange={(newValue) => setStartTime(newValue)}
                                sx={{ width: "50%" }}
                            />
                            <TimePicker
                                label="종료시간"
                                value={endTime}
                                disabled={is24Hours}
                                onChange={(newValue) => setEndTime(newValue)}
                                sx={{ width: '50%' }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={is24Hours}
                                        onChange={(e) => setIs24Hours(e.target.checked)}
                                    />
                                }
                                label="24시간"
                            />
                        </Stack>
                    </LocalizationProvider>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isLocalFranchise === 1}
                                onChange={(e) => setIsLocalFranchise(e.target.checked ? 1 : 0)}
                            />
                        }
                        label="서울지역사랑상품권 가맹점 여부"
                    />
                    <TextField
                        name="reason"
                        label="요청 사유"
                        multiline
                        variant="outlined"
                        value={shopInfo.reason}
                    />
                    <Stack direction="row-reverse" gap={3}>
                        <Button
                            variant="contained"
                            sx={{
                                mr: '10px',
                                borderRadius: "15px",
                                backgroundColor: "black",
                                ":hover": { backgroundColor: "grey" }
                            }}
                            onClick={() => handleProposalAction("approve")}
                            disabled={shopInfo.status !== "PENDING"}
                        >
                            승인
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                mr: '10px',
                                borderRadius: "15px",
                                backgroundColor: "black",
                                ":hover": { backgroundColor: "grey" }
                            }}
                            onClick={() => handleProposalAction("approveUnregistered")}
                            disabled={shopInfo.status !== "PENDING"}
                        >
                            승인(미등록)
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                mr: '10px',
                                borderRadius: "15px",
                                backgroundColor: "black",
                                ":hover": { backgroundColor: "grey" }
                            }}
                            onClick={() => handleProposalAction("reject")}
                            disabled={shopInfo.status !== "PENDING"}
                        >
                            반려
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: "15px",
                                backgroundColor: "lightgrey",
                                color: "black",
                                ":hover": { backgroundColor: "grey" }
                            }}
                            onClick={navigateToMainadmin}
                        >
                            취소
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
}

