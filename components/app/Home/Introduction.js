import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { Container } from "@mui/material"
import Link from "next/link"

const Introduction = () => (
    <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
        >
            Explore Cancer Copy Number Variations with{' '}
            <Box
                component="span"
                sx={{
                    background: 'linear-gradient(to right, #34d399, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                }}
            >
                CNVScope
            </Box>
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: '36px' }}>
            A comprehensive CNV visualization platform covering 47 GDC projects, enabling chromosome-level and gene-level insights into cancer genomics.
        </Typography>

        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            mt={4}
        >
            <Button
                variant="outlined"
                href="#dataset-statistics"
                sx={{
                    borderColor: '#0ea5e9',
                    color: '#0ea5e9',
                    px: 3,
                    '&:hover': {
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderColor: '#0ea5e9'
                    },
                }}
            >
                Data Statistics
            </Button>
            <Link href='/view'>
                <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIcon/>}
                    sx={{
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        px: 3,
                        '&:hover': {
                            backgroundColor: '#2563eb',
                            borderColor: '#2563eb'
                        },
                    }}
                >
                    Explore Data
                </Button>
            </Link>
        </Stack>
    </Container>
)

export default Introduction
