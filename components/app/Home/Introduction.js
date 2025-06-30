import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import {Container} from "@mui/material"
import Link from "next/link"

const Introduction = () => (
    <Container maxWidth="lg" sx={{py: 10, textAlign: 'center'}}>
        <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
                fontSize: {xs: '2.5rem', md: '3.5rem'},
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

        <Typography variant="h6" color="text.secondary" gutterBottom sx={{mt: '36px'}}>
            CNVScope aggregates high-quality CNV data from a broad spectrum of nine major cancer genomics programs,
            including TCGA, TARGET, HCMI, and others. It harmonizes both sequencing-based and array-based
            CNV datasets, and provides both chromosome-level and gene-level CNV profiles across <strong>33</strong> cancer types and <strong>53</strong> anatomical
            sites, supporting robust cross-study exploration. In total, it gathers <strong>47</strong> cancer projects, <strong>19,905</strong> sample
            cases, <strong>467,206</strong> biospecimens, <strong>112,297</strong> CNV profiles, and <strong>239,645</strong> associated clinical records.
        </Typography>

        <Stack
            direction={{xs: 'column', sm: 'row'}}
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
