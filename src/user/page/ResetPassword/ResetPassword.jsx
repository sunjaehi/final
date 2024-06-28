import React, { useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from "@mui/material/CssBaseline";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Snackbar, Alert, FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const backend = process.env.REACT_APP_BACKEND_ADDR;

const PasswordInput = ({ label, value, onChange }) => (
    <FormControl sx={{ mt: 2, width: '100%' }} variant="outlined">
        <InputLabel htmlFor={`outlined-adornment-${label}`}>{label}</InputLabel>
        <OutlinedInput
            type='password'
            value={value}
            onChange={onChange}
            label={label}
            sx={{ width: '100%' }}
        />
    </FormControl>
);

export default function ResetPassword() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setNewPassword(newPassword);
        setIsPasswordVerified(validatePassword(newPassword) && newPassword === newPasswordConfirm);
    };

    const handlePasswordConfirmChange = (e) => {
        const newPasswordConfirm = e.target.value;
        setNewPasswordConfirm(newPasswordConfirm);
        setIsPasswordVerified(validatePassword(newPassword) && newPassword === newPasswordConfirm);
    };

    const submit = () => {
        if (newPassword !== newPasswordConfirm) {
            setSnackbarMessage("새 비밀번호가 일치하지 않습니다.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const body = JSON.stringify({
            uuid: uuid,
            password: newPassword
        });

        fetch(`${backend}/api/v1/member/reset-password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                setSnackbarMessage("서버 오류가 발생했습니다.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
        }).then(result => {
            if (result === true) {
                setSnackbarMessage("비밀번호 변경 완료");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                navigate('/login');
            } else {
                setSnackbarMessage("비밀번호 변경 실패");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        });
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '80px' }}>
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Avatar sx={{ mb: 1, bgcolor: 'secondary.main' }}> <SettingsIcon /> </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}> 비밀번호 재설정 </Typography>
                <Box noValidate sx={{ mt: 1, width: '100%' }}>
                    <PasswordInput
                        label="새로운 비밀번호"
                        value={newPassword}
                        onChange={handlePasswordChange}
                    />
                    {!validatePassword(newPassword) && (
                        <Alert severity='warning' sx={{ mt: 2 }}>비밀번호는 최소 8자 이상이어야 하며, 영문자, 숫자, 특수 문자가 각각 최소 하나 이상 포함되어야 합니다.</Alert>
                    )}
                    {validatePassword(newPassword) && (
                        <Alert severity='success' sx={{ mt: 2 }}>사용 가능한 비밀번호입니다.</Alert>
                    )}
                    <PasswordInput
                        label="새로운 비밀번호 확인"
                        value={newPasswordConfirm}
                        onChange={handlePasswordConfirmChange}
                    />
                    {newPassword !== newPasswordConfirm && newPasswordConfirm && (
                        <Alert severity='warning' sx={{ mt: 2 }}>비밀번호가 일치하지 않습니다.</Alert>
                    )}
                    {newPassword === newPasswordConfirm && validatePassword(newPassword) && (
                        <Alert severity='success' sx={{ mt: 2 }}>비밀번호가 일치합니다.</Alert>
                    )}
                    <Button color="primary" variant="contained" fullWidth sx={{ mt: 3, mb: 2 }} onClick={submit} disabled={!isPasswordVerified}>수정 완료</Button>
                </Box>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}
