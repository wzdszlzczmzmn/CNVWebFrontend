
import {
    BankOutlined,
    BookOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    MailOutlined, UserOutlined
} from "@ant-design/icons";
import {Card} from "antd";
import Stack from "@mui/material/Stack"
import { H6, Span } from "../../styledComponents/styledHTMLTags"
import Grid from "@mui/material/Grid"

const ContactContent = ({}) => {
    return (
        <Stack>
            <ContactHeader/>
            <ContactBody/>
        </Stack>
    )
}

const ContactHeader = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center', marginTop: '40px'}}>
            <H6 sx={{ fontSize: '64px' }}>Contact</H6>
        </Stack>
    )
}

const ContactBody = () => {
    return (
        <Grid container spacing={2} sx={{marginTop: '64px', marginBottom: '48px'}}>
            <Grid xs={6}>
                <TeamIntroduction/>
            </Grid>
            <Grid xs={6}>
                <Authors/>
            </Grid>
        </Grid>
    )
}

const TeamIntroduction = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center'}}>
            <H6 sx={{fontSize: '40px', paddingBottom: '20px'}}>Our Lab</H6>
            <Stack
                sx={{
                    border: '1px solid #0000001F',
                    borderRadius: '10px',
                    padding: '40px 36px'
                }}
            >
                <Stack spacing={1} sx={{alignItems: 'center'}}>
                    <Span
                        sx={{
                            fontSize: '28px',
                            paddingBottom: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Lab Information
                    </Span>
                    <Stack spacing={2} sx={{alignSelf: 'flex-start', fontSize: '20px'}}>
                        <Stack direction="row" spacing={1}>
                            <ExperimentOutlined/>
                            <Span><b>Lab Name:</b> <a href="https://compbioclub.github.io"
                                                      target="_blank">CompBioClub</a></Span>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BookOutlined/>
                            <Span><b>Department:</b> Department of Biomedical Sciences</Span>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BankOutlined/>
                            <Span><b>School:</b> City University of Hong Kong</Span>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <MailOutlined/>
                            <Span><b>Email:</b> lingxi.chen@cityu.edu.hk</Span>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <UserOutlined/>
                            <Span><b>Profile:</b> <a href="https://www.cityu.edu.hk/bms/profile/lingxichen.htm"
                                                     target="_blank">Lingxi Chen</a></Span>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                            <EnvironmentOutlined/>
                            <Span><b>Address:</b> 1A-102, 1/F, Block 1, To Yuen Building, Tat Chee Avenue, Kowloon, Hong Kong, China</Span>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
}

const AuthorsCard = ({name, email, char, colorIndex = 0}) => {
    const colors = [
        '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
        "#FF5733", "#33FF57", "#5733FF", "#FF33A1",
        "#33A1FF", "#F9A825", "#8E24AA", "#00BCD4",
        "#009688", "#3F51B5"
    ]

    return (
        <Card
            style={{
                width: 320,
                border: '1px solid #0000001F',
                fontSize: '18px',
            }}
        >
            {/*<Stack sx={{ alignItems: 'center', paddingBottom: '12px' }}>*/}
            {/*    <Avatar style={{ backgroundColor: colors[colorIndex], verticalAlign: 'middle' }} size={56}>*/}
            {/*        {char}*/}
            {/*    </Avatar>*/}
            {/*</Stack>*/}
            <Stack spacing={1}>
                <Stack direction="row" spacing={1}>
                    <UserOutlined />
                    <Span sx={{ fontWeight: '600' }}>{name}</Span>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <MailOutlined/>
                    <Span>{email}</Span>
                </Stack>
            </Stack>
        </Card>
    )
}

const Authors = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center'}}>
            <H6 sx={{fontSize: '40px', paddingBottom: '20px'}}>Authors</H6>
            <Stack spacing={4}>
                <Grid container spacing={4} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Xikang Feng" email="fxk@nwpu.edu.cn" char="F" colorIndex={4} />
                    </Grid>
                    <Grid xs={6}>
                        <AuthorsCard name="Lingxi Chen" email="lingxi.chen@cityu.edu.hk" char="C" colorIndex={3} />
                    </Grid>
                </Grid>
                <Grid container spacing={4} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Jieyi Zheng" email="zhengjieyi@mail.nwpu.edu.cn" char="Z" colorIndex={12} />
                    </Grid>
                </Grid>
            </Stack>
        </Stack>
    )
}

export default ContactContent
