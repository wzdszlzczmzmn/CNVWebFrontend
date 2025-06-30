import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { Container, Tooltip } from "@mui/material";
import { H6, Hr, Img, Span } from "./styledComponents/styledHTMLTags"
import { CustomFooter } from "./styledAntdComponent/styledLayoutComponents"
import { EnvironmentOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"


const Footer = () => {

    return (
        <CustomFooter>
            <Container maxWidth="xl">
                <Hr sx={{marginBottom: '24px'}}/>
                <Grid container>
                    <Grid item xs={1}/>
                    <Grid item xs={6}>
                        <Stack spacing={2}>
                            <H6 sx={{fontSize: '24px', paddingBottom: '6px'}}>
                                Contact us
                            </H6>
                            <Stack direction="row" spacing={1} sx={{fontSize: '16px', alignItems: 'center'}}>
                                <EnvironmentOutlined/>
                                <Span>Address: 1A-102, 1/F, Block 1, To Yuen Building, Tat Chee Avenue, Kowloon, Hong
                                    Kong, China</Span>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{fontSize: '16px', alignItems: 'center'}}>
                                <MailOutlined/>
                                <Span>Email: lingxi.chen@cityu.edu.hk</Span>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{fontSize: '16px', alignItems: 'center'}}>
                                <UserOutlined/>
                                <Span>Profile: <a href="https://www.cityu.edu.hk/bms/profile/lingxichen.htm"
                                                  target="_blank">Lingxi Chen</a></Span>
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item xs={1.5}/>
                    <Grid item xs={3}>
                        <Stack sx={{fontSize: '16px'}} spacing={2}>
                            <Img
                                src="/bms_logo.svg"
                                alt="CityU Logo"
                                width={300}
                                height={78}
                                style={{marginLeft: '16px'}}
                            />
                            <Stack spacing={1}>
                                <Span>©{new Date().getFullYear()} City University of HongKong</Span>
                                <Span>This website does not use cookies.</Span>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
                <Hr sx={{ paddingTop: '16px' }}/>
                <Stack sx={{ alignItems: 'center', marginTop: '16px', fontSize: '16px' }} spacing={0.5}>
                    <Stack direction="row">
                        <Span>We keep user data private, accessible only to the user, and avoid using Flash or Java plugins for security reasons.</Span>
                    </Stack>
                    <Stack>
                        <Span>We hereby grant free access to all users, including commercial entities, to use our services as outlined on this platform. No payment or subscription is required.</Span>
                    </Stack>
                </Stack>
            </Container>
        </CustomFooter>
    )
}

export default Footer;
