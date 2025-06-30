import { Card, Typography } from 'antd'
import { Container } from "@mui/material"
import Grid from "@mui/material/Grid"
import DiseasesAndSitesChart from "./diseasesAndSitesChart"
import Box from "@mui/material/Box"
import {
    AssignmentInd,
    Biotech,
    Description,
    FolderOpen,
    LocalHospital,
    PeopleAlt,
    TravelExplore
} from "@mui/icons-material"

const { Title, Text } = Typography

const stats = [
    {
        icon: (
            <FolderOpen style={{ fontSize: 24, color: '#1e3a8a' }} />
        ),
        value: '47',
        label: 'Projects',
        bgColor: '#e0f2fe',
    },
    {
        icon: (
            <LocalHospital style={{ fontSize: 24, color: '#b91c1c' }} />
        ),
        value: '33',
        label: 'Cancer Types',
        bgColor: '#fee2e2',
    },
    {
        icon: (
            <TravelExplore style={{ fontSize: 24, color: '#1e40af' }} />
        ),
        value: '53',
        label: 'Anatomical Sites',
        bgColor: '#dbeafe',
    },
    {
        icon: (
            <PeopleAlt style={{ fontSize: 24, color: '#92400e' }} />
        ),
        value: '19,905',
        label: 'Cases',
        bgColor: '#fef9c3',
    },
    {
        icon: (
            <Biotech style={{ fontSize: 24, color: '#065f46' }} />
        ),
        value: '467,206',
        label: 'Biospecimens',
        bgColor: '#d1fae5',
    },
    {
        icon: (
            <Description style={{ fontSize: 24, color: '#6b21a8' }} />
        ),
        value: '112,297',
        label: 'CNV Files',
        bgColor: '#f3e8ff',
    },
    {
        icon: (
            <AssignmentInd style={{ fontSize: 24, color: '#7f1d1d' }} />
        ),
        value: '239,645',
        label: 'Clinical Records',
        bgColor: '#fee2e2',
    },
]

const Statistic = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 1 }}>
            <Title id="dataset-statistics" level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
                Dataset Statistics
            </Title>
            <Grid container spacing={3} justifyContent="center">
                {stats.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card key={index} style={{ flex: '1 1 20%' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: item.bgColor,
                                        borderRadius: '50%',
                                        padding: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 16,
                                        minWidth: 48,
                                        minHeight: 48,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {item.value}
                                    </Title>
                                    <Text type="secondary">{item.label}</Text>
                                </div>
                            </div>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 3 }}>
                <DiseasesAndSitesChart />
            </Box>
        </Container>
    )
}


export default Statistic
