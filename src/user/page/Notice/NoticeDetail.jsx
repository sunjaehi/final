import React, { useEffect, useState } from "react";
import Pagination from '@mui/material/Pagination';
import { Container, Divider, Typography, Box, Button } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

const backend = process.env.REACT_APP_BACKEND_ADDR;

function NoticeDetail() {
    const navigate = useNavigate();
    const navigateToNotice = () => {
        navigate("/Notice");
    }

    const [notice, setNotice] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get('id');
    useEffect(() => {
        fetch(`${backend}/api/v1/notice/${id}`)
            .then(response => response.json())
            .then(json => setNotice(json));

    }, [])
    return (
        <Container maxWidth="sm">
            {notice && (<Typography variant="body1" sx={{ marginTop: 8 }}>{notice.title}</Typography>)}
            {/* {notice && (<p>{notice.author}</p>)} */}
            <Box sx={{ display: 'flex', justifyContent: ' space-between', alignItems: 'center' }}>
                {notice && (<Typography variant="body1" sx={{ marginTop: 2, marginBottom: 1 }}>{notice.createdAt}</Typography>)}
                {notice && (<Typography variant="caption" sx={{ marginTop: 2, marginBottom: 1, textAlign: 'right' }}>조회수 : {notice.viewCount}</Typography>)}
            </Box>

            <Divider />
            {notice && (<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', marginBottom: 1, marginTop: 1 }}>{notice.content}</Typography>)}
            <Divider sx={{ marginBottom: 1 }} />
            {notice && notice.imgUrls.map(imgUrl => (
                <img src={imgUrl} style={{ width: '100%', height: '100%' }} />
            ))}
            <Divider sx={{ marginTop: 1 }} />
            <Button startIcon={<ArrowBackOutlinedIcon />} onClick={navigateToNotice}>목록으로</Button>
        </Container>
    );
}
export default NoticeDetail;