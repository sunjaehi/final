import React, { useEffect, useRef } from 'react';
import { SwipeableDrawer, Box, Typography, Card, CardContent, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Carousel from 'react-material-ui-carousel';
import { grey } from '@mui/material/colors';

const drawerBleeding = 56;

const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

const ImageContainer = styled('div')({
    width: '100%',
    height: 200,
    overflow: 'hidden',
    position: 'relative'
});

const Image = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
});

const Puller = styled('div')(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
}));

const ShopNewsDrawer = ({ open, onClose, onOpen, shopNewsDatas, fetchMoreData }) => {
    const observerRef = useRef();
    const theme = useTheme();
    const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMoreData();
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [observerRef.current, fetchMoreData]);

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            onOpen={onOpen}
            swipeAreaWidth={isMobileOrTablet ? drawerBleeding : 0}
            disableSwipeToOpen={false}
            ModalProps={{
                keepMounted: true,
            }}
            PaperProps={{
                sx: {
                    height: `calc(80% - ${isMobileOrTablet ? drawerBleeding : 0}px)`,
                    overflow: 'visible',
                    maxWidth: isDesktop ? theme.breakpoints.values.sm : '100%',
                    margin: '0 auto',
                },
            }}
        >
            <StyledBox
                sx={{
                    position: 'absolute',
                    top: isMobileOrTablet ? -drawerBleeding : 10,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    visibility: 'visible',
                    right: 0,
                    left: 0,
                }}
            >
                <Puller />
                <Typography sx={{ p: 2, color: 'text.secondary' }}>가게 소식</Typography>
            </StyledBox>
            <StyledBox
                sx={{
                    position: 'absolute',
                    top: isMobileOrTablet ? 0 : drawerBleeding,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    visibility: 'visible',
                    px: 2,
                    pb: 2,
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                {shopNewsDatas.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>아직 가게 소식이 없어요</Typography>
                ) : (
                    shopNewsDatas.map((news, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body" color="text.secondary">{news.shopName}</Typography>
                                    <Typography variant='body2' color="text.secondary">{news.createdAt}</Typography>
                                </Box>
                                <Typography variant="h6">{news.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{news.content}</Typography>
                                {news.imgUrls && news.imgUrls.length > 0 && (
                                    <Carousel autoPlay={false} animation="slide" timeout={1000}>
                                        {news.imgUrls.map((url, idx) => (
                                            <ImageContainer key={idx}>
                                                <Image src={url} alt={`뉴스 이미지 ${idx + 1}`} />
                                            </ImageContainer>
                                        ))}
                                    </Carousel>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
                <div ref={observerRef} />
            </StyledBox>
        </SwipeableDrawer >
    );
};

export default ShopNewsDrawer;
