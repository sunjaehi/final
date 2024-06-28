import { Clear } from "@mui/icons-material";
import { Container, IconButton, List, ListItem, ListItemButton, ListItemText, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function RecommendHistory() {
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);

    useEffect(() => {
        const atk = sessionStorage.getItem('atk');
        if (!atk) {
            alert('로그인이 필요합니다');
            navigate(-1);
            return;
        }
        fetch(`${backend}/api/v1/shopRecommend/list`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${atk}`
            }
        }).then(response => response.json())
            .then(json => setShops(json));
    }, [navigate]);

    const handleClickOpen = (shop) => {
        setSelectedShop(shop);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedShop(null);
    };

    const handleDelete = () => {
        if (selectedShop) {
            const atk = sessionStorage.getItem('atk');
            fetch(`${backend}/api/v1/shopRecommend/remove`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${atk}`
                },
                body: JSON.stringify({ shopId: selectedShop.shopId })
            }).then(response => {
                if (response.ok) {
                    setShops(shops.filter(shop => shop.shopId !== selectedShop.shopId));
                    handleClose();
                } else {
                    alert('추천 해제 실패');
                }
            });
        }
    };

    const handleListItemClick = (shopId) => {
        navigate(`/detail/${shopId}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Container maxWidth="sm" sx={{ paddingTop: '16px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontSize: '1.25rem' }}>
                추천 내역
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
            {shops.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '60vh',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" color="textSecondary">
                        추천하신 가게가 없습니다
                    </Typography>
                </Box>
            ) : (
                <List>
                    {shops.map((shop) => (
                        <ListItem key={shop.shopId} disablePadding>
                            <ListItemButton onClick={() => handleListItemClick(shop.shopId)}>
                                <ListItemText
                                    primary={shop.shopName}
                                    secondary={shop.shopAddress}
                                />
                                <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleClickOpen(shop); }}>
                                    <Clear />
                                </IconButton>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"추천 해제"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {selectedShop ? `${selectedShop.shopName} 추천을 취소하시겠습니까?` : ''}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        아니요
                    </Button>
                    <Button onClick={handleDelete} color="primary" autoFocus>
                        예
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
