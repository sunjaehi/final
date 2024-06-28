import React, { useEffect, useState } from "react";
import { TextField, Box, MenuItem, FormControlLabel, Checkbox, Stack, InputLabel, Select, FormControl, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Adminlist from "../section/Adminlist";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { postcodeScriptUrl } from "react-daum-postcode/lib/loadPostcode";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const backend = process.env.REACT_APP_BACKEND_ADDR;

function RegisterShop() {
    const [sectors, setSectors] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [zipcode, setZipcode] = useState(null);
    const [address, setAddress] = useState(null);
    const [regionId, setRegionId] = useState(null);
    const [startTime, setStartTime] = useState(dayjs("2024-05-20T09:00"));
    const [endTime, setEndTime] = useState(dayjs());
    const [isAllDay, setIsAllDay] = useState(false);
    const [isLocalFranchise, setIsLocalFranchise] = useState(false);
    const [formData, setFormData] = useState({
        shopName: "",
        phone: "",
        boast: "",
        info: "",
        zipcode: "",
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const navigate = useNavigate();
    const open = useDaumPostcodePopup(postcodeScriptUrl);

    useEffect(() => {
        fetch(`${backend}/api/v1/sector/`)
            .then((result) => result.json())
            .then((json) => setSectors(json));
    }, []);

    const handleFormInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSectorChange = (e) => {
        setSelectedSector(e.target.value);
    };

    const handleAddressComplete = (data) => {
        if (data.addressType === "R") {
            setAddress(data.roadAddress);
            setZipcode(data.zonecode);
            setRegionId(data.sigunguCode);
        }
    };

    const handleAddressSearch = () => {
        open({ onComplete: handleAddressComplete });
    };

    const handleStartTimeChange = (newValue) => {
        setStartTime(newValue);
    };

    const handleEndTimeChange = (newValue) => {
        setEndTime(newValue);
    };

    const formatTime = (time) => {
        return time.format("HH:mm");
    };

    const handleFileChange = (e) => {
        let newFiles = Array.from(e.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    const isFormValid = () => {
        return (
            formData.shopName &&
            selectedSector &&
            zipcode &&
            address &&
            formData.phone &&
            formData.boast &&
            formData.info
        );
    };

    const submit = (event) => {
        event.preventDefault();
        if (!isFormValid()) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }
        const businessHours = isAllDay
            ? `00:00 - 24:00`
            : `${formatTime(startTime)} - ${formatTime(endTime)}`;

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.shopName);
        formDataToSend.append("address", address);
        formDataToSend.append("sectorId", selectedSector);
        formDataToSend.append("regionId", regionId);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("boast", formData.boast);
        formDataToSend.append("info", formData.info);
        formDataToSend.append("businessHours", businessHours);
        formDataToSend.append("isLocalFranchise", isLocalFranchise ? 1 : 0);
        formDataToSend.append("zipcode", zipcode);
        selectedFiles.forEach((file) => formDataToSend.append("files", file));

        fetch(`${backend}/api/v1/shop/register`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("atk"),
            },
            body: formDataToSend,
        }).then((response) => {
            if (response.status === 200) {
                navigate("/shopmanage");
            } else {
                alert("등록 실패");
            }
        });
    };

    return (
        <Box sx={{ flexDirection: "row", display: "flex" }}>
            <Adminlist />
            <Stack
                component="form"
                spacing={3}
                autoComplete="off"
                width="50%"
                justifyContent="center"
                margin={5}
                ml={10}
            >
                <Box sx={{ display: "flex", minWidth: "100", flexDirection: "row", gap: 3 }}>
                    <TextField
                        id="shopName"
                        label="상호명"
                        multiline
                        variant="standard"
                        sx={{ width: "50%" }}
                        value={formData.shopName}
                        onChange={handleFormInputChange}
                    />
                    <FormControl sx={{ width: "50%" }}>
                        <InputLabel id="select-label">업종 분류</InputLabel>
                        <Select
                            labelId="sector-label"
                            id="sector"
                            value={selectedSector}
                            label="업종별"
                            onChange={handleSectorChange}
                        >
                            {sectors &&
                                sectors.map((sector) => (
                                    <MenuItem key={sector.id} value={sector.id}>
                                        {sector.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: "flex", minWidth: "100", flexDirection: "row", gap: 3 }}>
                    <TextField
                        id="zipcode"
                        placeholder="우편번호"
                        multiline
                        inputProps={{ readOnly: true, disableUnderline: true }}
                        value={zipcode}
                        variant="standard"
                        sx={{ width: "80%" }}
                    />
                    <Button
                        onClick={handleAddressSearch}
                        variant="contained"
                        sx={{
                            bgcolor: "black",
                            color: "white",
                            ":hover": {
                                bgcolor: "gray",
                            },
                        }}
                    >
                        주소 찾기
                    </Button>
                </Box>
                <TextField
                    id="address"
                    placeholder="가게 주소"
                    inputProps={{ readOnly: true, disableUnderline: true }}
                    multiline
                    value={address}
                    variant="standard"
                />
                <TextField
                    id="phone"
                    label="연락처"
                    multiline
                    variant="standard"
                    value={formData.phone}
                    onChange={handleFormInputChange}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div>
                        <TimePicker
                            label="시작시간"
                            value={startTime}
                            disabled={isAllDay}
                            onChange={handleStartTimeChange}
                            sx={{ width: "50%" }}
                        />
                        <TimePicker
                            label="종료시간"
                            value={endTime}
                            disabled={isAllDay}
                            onChange={handleEndTimeChange}
                            sx={{ width: "50%" }}
                        />
                    </div>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isAllDay}
                                onChange={(e) => setIsAllDay(e.target.checked)}
                            />
                        }
                        label="24시간"
                    />
                </LocalizationProvider>
                <TextField
                    id="boast"
                    label="자랑거리"
                    multiline
                    variant="standard"
                    value={formData.boast}
                    onChange={handleFormInputChange}
                />
                <TextField
                    id="info"
                    label="기타정보"
                    multiline
                    variant="standard"
                    value={formData.info}
                    onChange={handleFormInputChange}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isLocalFranchise}
                            onChange={(e) => setIsLocalFranchise(e.target.checked)}
                        />
                    }
                    label="서울사랑상품권 사용 가능"
                />
                <Box flexDirection="row" gap={5}>
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{
                            mr: "5px",
                            bgcolor: "grey",
                        }}
                        onClick={submit}
                        disabled={!isFormValid()}
                    >
                        등록
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "black",
                            ":hover": {
                                bgcolor: "grey",
                            },
                        }}
                        onClick={() =>
                            setFormData({
                                shopName: "",
                                phone: "",
                                boast: "",
                                info: "",
                                zipcode: "",
                            })
                        }
                    >
                        초기화
                    </Button>
                </Box>
            </Stack>
            <Box display="flex" mt={5}>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="file"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                        color: "black",
                        backgroundColor: "lightgrey",
                        borderRadius: "10px",
                        mt: "10px",
                        ml: "5px",
                        height: "50px",
                        ":hover": {
                            backgroundColor: "grey",
                        },
                    }}
                    onClick={() => document.getElementById("file").click()}
                >
                    사진 추가
                </Button>
            </Box>
            <div
                className="preview"
                style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}
            >
                {previews.map((preview, index) => (
                    <div key={index} style={{ position: "relative", margin: "10px" }}>
                        <img
                            alt="미리보기 제공 불가"
                            src={preview}
                            style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                margin: "10px",
                            }}
                        />
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => removeImage(index)}
                            style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: "5px",
                            }}
                        >
                            X
                        </Button>
                    </div>
                ))}
            </div>
        </Box>
    );
}

export default RegisterShop;
