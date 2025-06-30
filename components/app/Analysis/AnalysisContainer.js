import { Button, Card, Modal, Result, Typography } from "antd"
import Stack from "@mui/material/Stack"
import SubmitForm from "./AnalysisForm"
import { useState } from "react"
import { useRouter } from "next/router"
import { CheckCircleFilled, CloseCircleFilled, CopyOutlined } from "@ant-design/icons"
import { Span } from "../../styledComponents/styledHTMLTags"
import Box from "@mui/material/Box"

const { Title, Paragraph } = Typography

const AnalysisContainer = ({}) => {
    const [isDemoModalOpen, setDemoModalOpen] = useState(false)
    const [isModalOpen, setIsModelOpen] = useState(false)
    const [taskUUID, setTaskUUID] = useState('')
    const [taskName, setTaskName] = useState('')
    const [submissionStatus, setSubmissionStatus] = useState(true)

    const router = useRouter()

    const handleNavigate = (path) => {
        router.push(path)
    }

    return (
        <>
            <Stack alignItems="center" spacing={6}>
                <Card
                    title={<Title level={2}>Recurrent CNV Analysis Submission</Title>}
                    style={{
                        width: '1080px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                    }}
                >
                    <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
                        Please upload your CNV data and set analysis parameters to run a GISTIC2 task.
                    </Paragraph>
                    <SubmitForm
                        setTaskUUID={setTaskUUID}
                        setSubmissionStatus={setSubmissionStatus}
                        setTaskName={setTaskName}
                        setIsModelOpen={setIsModelOpen}
                    />
                </Card>
            </Stack>
            <ResultModal
                isModalOpen={isModalOpen}
                setIsModelOpen={setIsModelOpen}
                taskUUID={taskUUID}
                taskName={taskName}
                submissionStatus={submissionStatus}
            />
        </>
    )
}

const ResultModal = ({isModalOpen, setIsModelOpen, submissionStatus, taskUUID, taskName}) => {
    const handleConfirm = () => {
        setIsModelOpen(false)
    }

    const handleDownloadFile = () => {
        const blob = new Blob([taskUUID], {type: 'text/plain'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${taskName}_UUID.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(taskUUID).then(() => {
            message.success('Task UUID Copy Successfully!');
        }).catch((err) => {
            message.error('Failed To Copy Task UUID.');
        });
    }

    return (
        <Modal
            title={null}
            open={isModalOpen}
            footer={null}
            centered
            closable={false}
        >
            <Result
                status={submissionStatus ? 'success' : 'error'}
                title={submissionStatus ? 'Successfully Submit A Task!' : 'Some Error Occur During Submission!'}
                subTitle={submissionStatus ? 'Please keep the below UUID for task querying!' : ''}
                icon={
                    submissionStatus ?
                        <CheckCircleFilled style={{fontSize: '72px', color: '#52c41a'}}/>
                        :
                        <CloseCircleFilled style={{fontSize: '72px', color: '#ff4d4f'}}/>
                }
                extra={
                    submissionStatus ?
                        <Stack sx={{alignItems: 'center', marginBottom: '-40px'}} spacing={3}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '350px',
                                    backgroundColor: '#0053B30D',
                                    borderRadius: '12px',
                                    padding: '16px 16px',
                                    fontSize: '14px'
                                }}
                            >
                                <Span>{taskUUID}</Span>
                                <Span><CopyOutlined style={{color: 'rgb(148 163 184)'}}
                                                    onClick={handleCopy}/></Span>
                            </Stack>
                            <Stack direction="row" spacing={3}>
                                <Button
                                    onClick={handleDownloadFile}
                                    size="large"
                                    style={{width: '180px'}}
                                >
                                    Download as TXT
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{
                                        width: '180px'
                                    }}
                                    onClick={handleConfirm}
                                >
                                    Confirm Submission
                                </Button>
                            </Stack>
                        </Stack>
                        :
                        <Box sx={{marginBottom: '-40px'}}>
                            <Button onClick={handleConfirm} size="large" danger
                                    style={{width: '300px'}}>Confirm</Button>
                        </Box>
                }
            />
        </Modal>
    )
}

export default AnalysisContainer
