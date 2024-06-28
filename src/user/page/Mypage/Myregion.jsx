import React, { useEffect, useState } from "react";
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import { regionSample } from "../../../data/regionSample";
import { Container, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box } from "@mui/material";
const backend = process.env.REACT_APP_BACKEND_ADDR;

function Myregion() {
    const [selected, setSelcted] = useState(new Set());
    const [sortedRegions, setSortedRegions] = useState([]);

    useEffect(() => {
        const sorted = [...regionSample].sort((a, b) => a.name.localeCompare(b.name));
        setSortedRegions(sorted);
        fetch(`${backend}/api/v1/regionMark/`, {
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("atk")
            }
        }).then(response => {
            if (response.status === 200) {
                return response.json();
            }
        }).then(json => {
            console.log(json);
            setSelcted(new Set(json));
        })
    }, [])

    const handleChange = (event) => {
        const regionId = event.target.value;
        const isChecked = event.target.checked;

        setSelcted(prev => {
            const newSelected = new Set(prev);
            if (isChecked) newSelected.add(regionId);
            else newSelected.delete(regionId);

            return newSelected;
        })

        const bodyString = JSON.stringify(
            {
                regionId: regionId,
                isAdd: isChecked
            }
        )
        fetch(`${backend}/api/v1/regionMark/edit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("atk")
            },
            body: bodyString
        }).then(response => {
            if (response.status !== 200) alert('적용 실패....');
        })
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <Container maxWidth="sm">
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" sx={{ paddingTop: '16px' }}>
                <Typography variant="h5" gutterBottom>
                    관심 지역 설정
                </Typography>
                <Typography variant="body1" gutterBottom>
                    관심 있는 지역을 선택하여 설정하세요.<br /> 선택한 지역은 신규 가게가 추가될 경우 알림을 받을 수 있어요.
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
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {sortedRegions.map((region) => (
                    <React.Fragment key={region.id}>
                        <ListItem disablePadding>
                            <ListItemButton role={undefined}>
                                <ListItemText primary={region.name} />
                                <ListItemIcon>
                                    <Switch
                                        onChange={handleChange}
                                        value={region.id}
                                        checked={selected.has(region.id)}
                                        edge="start"
                                    />
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </Container>
    );
}

export default Myregion;
