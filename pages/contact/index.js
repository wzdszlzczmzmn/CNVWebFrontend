import { Container } from "@mui/material"
import Head from "next/head"
import React from "react"
import ContactContent from "../../components/app/Contact/ContactContent"

const Contact = () => {
    return (
        <>
            <Head>
                <title>Contact</title>
            </Head>
            <Container maxWidth="xl">
                <ContactContent/>
            </Container>
        </>
    )
}

export default Contact
