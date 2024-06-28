import { Delete } from "@mui/icons-material";
import { Container, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar, Alert, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backend = process.env.REACT_APP_BACKEND_ADDR;

function Myfavorite() {
    const navigate = useNavigate();
    const [shopMarks, setShopMarks] = useState([]);
    const [selectedShopMark, setSelectedShopMark] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        const atk = sessionStorage.getItem('atk');
        if (!atk) {
            alert('로그인이 필요합니다');
            navigate(-1);
            return;
        }

        fetchShopMarks(atk);
    }, [navigate]);

    const fetchShopMarks = async (atk) => {
        try {
            const response = await fetch(`${backend}/api/v1/shopmark/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${atk}`
                }
            });

            if (response.status === 200) {
                const json = await response.json();
                setShopMarks(json);
            } else if (response.status === 401 || response.status === 403) {
                alert('권한이 없습니다');
            } else {
                alert('서버 오류');
            }
        } catch (error) {
            console.error('Failed to fetch shop marks:', error);
            alert('서버 오류');
        }
    };

    const handleDeleteClick = (shopMark) => {
        setSelectedShopMark(shopMark);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedShopMark(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${backend}/api/v1/shopmark/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem('atk')}`
                },
                body: JSON.stringify({ shopId: selectedShopMark.shopId })
            });

            if (response.status === 200) {
                setShopMarks(shopMarks.filter(mark => mark.shopId !== selectedShopMark.shopId));
                setSnackbarMessage('삭제되었습니다');
                setSnackbarSeverity('success');
            } else {
                setSnackbarMessage('삭제에 실패했습니다');
                setSnackbarSeverity('error');
            }
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to delete shop mark:', error);
            setSnackbarMessage('삭제에 실패했습니다');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
        handleDialogClose();
    };

    const handleListItemClick = (shopId) => {
        navigate(`/detail/${shopId}`);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Container maxWidth="sm">
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" sx={{ paddingTop: '16px' }}>
                <Typography variant="h5" gutterBottom>
                    즐겨찾기
                </Typography>
                <Typography variant="body1" gutterBottom>
                    즐겨 찾는 가게 목록이에요.<br /> 가게를 클릭하여 상세 정보를 확인하거나 삭제할 수 있어요.
                </Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleBack}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                >
                    뒤로 가기
                </Button>
            </Box>
            {shopMarks.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <Typography variant="body1">
                        즐겨찾는 가게가 없어요. 즐겨찾는 가게를 추가해보세요.
                    </Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {shopMarks.map(shopMark => (
                        <ListItem key={shopMark.id} disablePadding>
                            <ListItemButton role={undefined} onClick={() => handleListItemClick(shopMark.shopId)}>
                                <ListItemText>
                                    <Typography variant="h6">
                                        {shopMark.shopName}
                                    </Typography>
                                    <Typography variant="body2">
                                        {shopMark.shopAddress}
                                    </Typography>
                                </ListItemText>
                                <IconButton
                                    aria-label="delete"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteClick(shopMark);
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
            <DeleteConfirmationDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onConfirm={handleDeleteConfirm}
            />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

function DeleteConfirmationDialog({ open, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>삭제 확인</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    삭제하시겠습니까?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    취소
                </Button>
                <Button onClick={onConfirm} color="primary" autoFocus>
                    삭제
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default Myfavorite;
