import { Card, Col, Row, Typography } from 'antd';
import { Container } from "@mui/material"
import { AutoGraph, BarChart, ScreenSearchDesktop } from "@mui/icons-material"

const { Title, Paragraph } = Typography

const features = [
    {
        icon: <ScreenSearchDesktop style={{ fontSize: '64px', color: '#3b82f6' }} />,
        title: 'Data Exploration',
        description: `Browse and filter CNV datasets from 47 GDC cancer projects. Access clinical metadata, project details, and summary statistics on key attributes such as disease types, primary sites, patient demographics, and more.`,
    },
    {
        icon: <BarChart style={{ fontSize: '64px', color: '#f59e0b' }} />,
        title: 'Interactive Visualization',
        description: `Generate visualizations such as Chromosome-Level CNV Heatmaps and Gene-Level CNV Heatmaps with just a few clicks. Customize plot configuration and filters to suit your analysis—no coding required.`,
    },
    {
        icon: <AutoGraph style={{ fontSize: '64px', color: '#10b981' }} />,
        title: 'Data Analysis',
        description: `Analyze CNV recurrence, frequency trends, and underlying variation patterns across cancer datasets. Explore genome-wide CNV landscapes and obtain clear, interpretable outputs—no coding required.`,
    },
]

const FeatureCards = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
                Features
            </Title>
            <Row gutter={[24, 24]} justify="center">
                {features.map((item, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                        <Card style={{ textAlign: 'center', height: '100%' }}>
                            {item.icon}
                            <Title level={4} style={{ margin: 8 }}>{item.title}</Title>
                            <Paragraph style={{ textAlign: 'left', padding: '0 12px' }}>{item.description}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default FeatureCards
