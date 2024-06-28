import React, { useEffect, useRef, useState } from "react";
import Adminlist from "../section/Adminlist";
import { Box, Divider, TextField, Button, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function NoticeAdminEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetch(`${backend}/api/v1/notice/${id}`)
            .then(response => response.json())
            .then(json => {
                setFormItem({
                    title: json.title,
                    content: json.content
                });
                setPreviews(json.imgUrls);
            })
    }, [id]);

    const navigateToMainadmin = () => {
        navigate("/Mainadmin");
    }
    const imageInput = useRef(null);
    const titleInput = useRef(null);
    const contentInput = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [deletedFiles, setDeletedFiles] = useState([]);
    const formData = new FormData();

    const [formItem, setFormItem] = useState({
        title: '',
        content: ''
    });
    const handleInput = (e) => {
        const { id, value } = e.target;
        setFormItem((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    }

    const noticeSubmit = (e) => {
        e.preventDefault();
        formData.append('noticeId', id);
        formData.append('title', titleInput.current.value);
        formData.append('content', contentInput.current.value);
        selectedFiles.forEach(file => formData.append('newFiles', file));
        deletedFiles.forEach(fileUrl => formData.append('deletedFiles', fileUrl));

        fetch(`${backend}/api/v1/notice`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("atk")
            },
            body: formData,
        })
            .then((response) => {
                if (response.status === 200) {
                    alert('공지사항이 수정 되었습니다.');
                    navigate(-1);
                } else {
                    alert('공지사항 수정에 실패했습니다.');
                }
            });
    };

    const onChangeFile = (e) => {
        let newFiles = Array.from(e.target.files);
        setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }

    const removeImage = (index) => {
        const removedPreview = previews[index];
        if (removedPreview.startsWith('http')) {
            setDeletedFiles(prevDeleted => [...prevDeleted, removedPreview]);
        } else {
            setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        }
        setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    }

    return (
        <form>
            <Box
                component="form"
                autoComplete="off"
                sx={{
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <Adminlist />
                <Divider orientation="vertical" variant="fullWidth" />
                <Box component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        margin: "10px",
                        mt: "10px",
                        width: "50%",
                        ml: "20px",
                    }}
                >
                    <TextField id="title" label="제목" inputRef={titleInput} variant="outlined" fullWidth sx={{ mb: "20px" }} value={formItem.title} onChange={handleInput} />
                    <TextField id="content" label="내용을 입력해주세요" inputRef={contentInput} variant="outlined" fullWidth multiline rows={15} value={formItem.content} onChange={handleInput} />
                    <Stack spacing={3} direction="row-reverse" sx={{ mt: "5px" }}>
                        <Button variant="contained" sx={{
                            color: "white", backgroundColor: "black", borderRadius: "20px",
                            ":hover": { backgroundColor: "grey" }
                        }}
                            onClick={noticeSubmit}
                        >등록</Button>
                        <Button variant="contained" sx={{
                            color: "white", backgroundColor: "grey", borderRadius: "20px",
                            ":hover": { backgroundColor: "lightgrey" }
                        }} onClick={navigateToMainadmin}>취소</Button>
                    </Stack>
                </Box>
                <>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={imageInput}
                        id="file"
                        onChange={onChangeFile}
                        style={{ display: "none" }}
                    />
                    <Button startIcon={<AddIcon />} variant="contained"
                        sx={{
                            color: "black", backgroundColor: "lightgrey", borderRadius: "10px", mt: "10px", ml: "5px", height: "50px",
                            ":hover": {
                                backgroundColor: "grey"
                            }
                        }}
                        onClick={() => imageInput.current.click()}
                    >
                        사진 추가
                    </Button>
                </>

                <div className="preview" style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                    {previews.map((preview, index) => (
                        <div key={index} style={{ position: 'relative', margin: '10px' }}>
                            <img
                                alt="미리보기 제공 불가"
                                src={preview}
                                style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '10px' }}
                            />
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => removeImage(index)}
                                style={{ position: 'absolute', top: '5px', right: '5px', minWidth: '30px', minHeight: '30px', padding: '5px' }}
                            >
                                X
                            </Button>
                        </div>
                    ))}
                </div>
            </Box>
        </form>
    );
}