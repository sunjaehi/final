import React, { useEffect, useState } from "react";
import { Container, List, ListItem, ListItemText, Typography, Box, Rating, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function ReviewHistory() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const atk = sessionStorage.getItem('atk');
        if (!atk) {
            alert('로그인이 필요합니다');
            navigate(-1);
            return;
        }
        fetch(`${backend}/api/v1/review/my-review-history`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${atk}`
            }
        }).then(response => response.json())
            .then(json => setReviews(json));
    }, [navigate]);

    const handleReviewClick = (shopId) => {
        navigate(`/review/${shopId}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Container maxWidth="sm" sx={{ paddingTop: '16px' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontSize: '1.25rem' }}>
                나의 리뷰 내역
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
            {reviews.length === 0 ? (
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
                        작성하신 리뷰가 없습니다
                    </Typography>
                </Box>
            ) : (
                <List>
                    {reviews.map((review) => (
                        <ListItem key={review.id} divider button onClick={() => handleReviewClick(review.shopId)}>
                            <ListItemText
                                primary={review.shopName}
                                secondary={
                                    <>
                                        <Typography variant="body2" color="textSecondary">
                                            {review.shopAddress}
                                        </Typography>
                                        <Box sx={{ my: 1 }} /> {/* 공백 추가 */}
                                        <Typography variant="body2" color="textSecondary">
                                            {review.comment}
                                        </Typography>
                                        <Rating value={review.score} readOnly />
                                        <Typography variant="body2" color="textSecondary">
                                            {review.createdAt}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Container>
    );
}
