import React, { useState, useEffect } from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LoginIcon from '@mui/icons-material/Login';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import base64 from 'base-64';
import { Snackbar, Alert } from "@mui/material";
import sessionStorage from "redux-persist/es/storage/session";
import { useCookies } from "react-cookie";

const defaultTheme = createTheme();

const backend = process.env.REACT_APP_BACKEND_ADDR;
function Login() {
    const navigate = useNavigate();
    const API = `${backend}/api/v1/member/login`;
    const [userEmail, setUseremail] = useState('');
    const [userPw, setUserpw] = useState('');
    const [loginCheck, setLoginCheck] = useState(false);

    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const handleClick = (message) => {
        setSnackbarMessage(message);
        setShowSnackbar(true);
    };
    const handleClose = (event) => {
        setShowSnackbar(false);
    };
    const CustomSnackbar = (props) => (
        <Snackbar
            autoHideDuration={6000}
            open={showSnackbar}
            onClose={handleClose}
            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            children={props.children}
        ></Snackbar>
    )
    const [isRemember, setIsRemember] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(["rememberUserEmail"]);

    useEffect(() => { //저장된 쿠키값이 있으면 값 셋팅
        if (cookies.rememberUserEmail !== undefined) {
            setUseremail(cookies.rememberUserEmail);
            setIsRemember(true);
        }
    }, []);
    const handleOnChange = (e) => {
        setIsRemember(e.target.checked);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(API, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8;'
            },
            body: JSON.stringify({
                email: userEmail,
                password: userPw
            }),
        });
        const result = await response.json();

        if (response.status === 200) {
            setLoginCheck(false);
            const atk = result.accessToken;

            let payload = atk.substring(atk.indexOf('.') + 1, atk.lastIndexOf('.'));
            let decoded = JSON.parse(base64.decode(payload));
            const loginedAuth = decoded.auth;
            const memberPk = decoded.id;
            sessionStorage.setItem('atk', atk);
            sessionStorage.setItem('role', loginedAuth);
            sessionStorage.setItem('id', memberPk);

            if (isRemember) {
                removeCookie('rememberUserEmail');
                setCookie('rememberUserEmail', userEmail);
            } else {
                removeCookie('rememberUserEmail');
            }

            navigate("/");
        } else if (response.status === 401) {
            handleClick('이메일과 비밀번호를 확인해주세요.');
            setLoginCheck(true);
        } else {
            handleClick('서버 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#1266f1' }}>
                        <LoginIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        로그인
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="이메일"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            defaultValue={cookies.rememberUserEmail}
                            onChange={(e) => setUseremail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="비밀번호"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={(e) => setUserpw(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" onChange={handleOnChange}
                                checked={isRemember} />}
                            label="이메일 저장"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3, mb: 2, backgroundColor: '#2a75f3',
                                ":hover": {
                                    backgroundColor: '#4285f4'
                                }
                            }}
                            onClick={handleSubmit}
                        >
                            로그인
                        </Button>
                        {showSnackbar && (
                            <CustomSnackbar>
                                <Alert severity="error">{snackbarMessage}</Alert>
                            </CustomSnackbar>
                        )}
                        <Grid container>
                            <Grid item xs>
                                <Link href="/Findpassword" variant="body2">
                                    비밀번호 찾기
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/Register" variant="body2">
                                    아직 회원이 아니신가요? 회원가입
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
export default Login;