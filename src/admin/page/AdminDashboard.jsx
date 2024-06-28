import React, { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Container, Typography, Grid, Paper, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const backend = process.env.REACT_APP_BACKEND_ADDR;

export default function Dashboard() {
    const [selectedRegion, setSelectedRegion] = useState("11110");
    const [sectorData, setSectorData] = useState({});
    const [sectors, setSectors] = useState([]);
    const [regions, setRegions] = useState([]);
    const [combinedRegionData, setCombinedRegionData] = useState([]);
    const [pieData, setPieData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        fetch(`${backend}/api/v1/sector/`)
            .then(response => response.json())
            .then(data => {
                setSectors(data);
            })
            .catch(error => console.error('Error fetching sectors:', error));
    }, []);

    useEffect(() => {
        if (sectors.length > 0) {
            fetch(`${backend}/api/v1/shop/shop-counts-sector`)
                .then(response => response.json())
                .then(data => {
                    const formattedData = data.reduce((acc, item) => {
                        const sectorInfo = sectors.find(s => s.id === item.sectorId);
                        const sectorName = sectorInfo ? sectorInfo.name : 'Unknown';
                        acc[sectorName] = item.count;
                        return acc;
                    }, {});
                    setSectorData(formattedData);
                })
                .catch(error => console.error('Error fetching sector data:', error));
        }
    }, [sectors]);

    useEffect(() => {
        fetch(`${backend}/api/v1/region/`)
            .then(response => response.json())
            .then(data => {
                setRegions(data);
            })
            .catch(error => console.error('Error fetching regions:', error));
    }, []);

    useEffect(() => {
        if (regions.length > 0) {
            fetch(`${backend}/api/v1/shop/shop-counts-region`)
                .then(response => response.json())
                .then(data => {
                    const formattedData = data.map(shop => {
                        const region = regions.find(r => r.id === shop.regionId);
                        return {
                            regionName: region ? region.name : 'Unknown',
                            count: shop.count
                        };
                    });
                    setCombinedRegionData(formattedData);
                })
                .catch(error => console.error('Error fetching region shop counts:', error));
        }
    }, [regions]);

    useEffect(() => {
        if (selectedRegion && sectors.length > 0) {
            fetch(`${backend}/api/v1/shop/shop-counts-sector-region?regionId=${selectedRegion}`)
                .then(response => response.json())
                .then(data => {
                    const labels = data.map(item => {
                        const sectorInfo = sectors.find(s => s.id === item.sectorId);
                        return sectorInfo ? sectorInfo.name : 'Unknown';
                    });
                    const counts = data.map(item => item.count);
                    setPieData({
                        labels,
                        datasets: [
                            {
                                data: counts,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                    'rgba(255, 159, 64, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    });
                })
                .catch(error => console.error('Error fetching pie chart data:', error));
        }
    }, [selectedRegion, sectors]);

    const handleChange = (event) => {
        setSelectedRegion(event.target.value);
    };

    const barData = {
        labels: Object.keys(sectorData),
        datasets: [
            {
                label: '업종별 상점 수',
                data: Object.values(sectorData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                지역별 상점 수
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Box p={2} sx={{ height: '200px' }}>
                            <BarChart
                                series={[
                                    { data: combinedRegionData.map(d => d.count) }
                                ]}
                                height={200}
                                xAxis={[{ data: combinedRegionData.map(d => d.regionName), scaleType: 'band' }]}
                                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        업종별 상점 수
                    </Typography>
                    <Paper elevation={3}>
                        <Box p={2} sx={{ height: '200px' }}>
                            <BarChart
                                series={[
                                    { data: barData.datasets[0].data }
                                ]}
                                height={200}
                                xAxis={[{ data: barData.labels, scaleType: 'band' }]}
                                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        지역 선택
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel id="region-select-label">지역 선택</InputLabel>
                        <Select
                            labelId="region-select-label"
                            value={selectedRegion}
                            label="지역 선택"
                            onChange={handleChange}
                        >
                            {regions.map(region => (
                                <MenuItem key={region.id} value={region.id}>
                                    {region.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        지역별 업종 수
                    </Typography>
                    <Paper elevation={3}>
                        <Box p={2} sx={{ height: '500px' }}>
                            <Pie data={pieData} height={500} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
