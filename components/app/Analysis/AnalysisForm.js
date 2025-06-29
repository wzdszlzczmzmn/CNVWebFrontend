import { Button, Form, Input, Space, Upload, Select, InputNumber, Tooltip, Card, Typography } from "antd"
import { Div, Span } from "../../styledComponents/styledHTMLTags"
import Stack from "@mui/material/Stack"
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons"
import { useState } from "react"
import axios from "axios"
import { postGISTICTaskURL } from "../../../data/post"

const SubmitForm = ({ setTaskUUID, setSubmissionStatus, setTaskName, setIsModelOpen }) => {
    const [expressionMatrixFileList, setExpressionMatrixFileList] = useState([])
    const [groupInformationFileList, setGroupInformationFileList] = useState([])
    const [queryProteinListFileList, setQueryProteinListFileList] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [form] = Form.useForm()

    const showModal = () => {
        setIsModelOpen(true)
    }

    const onReset = () => {
        form.resetFields()
        setExpressionMatrixFileList([])
        setGroupInformationFileList([])
        setQueryProteinListFileList([])
    }

    const onFinish = async (values) => {
        setIsSubmitting(true)
        const formData = new FormData()

        formData.append('taskName', values.taskName)
        formData.append('brlen', values.brlen)
        formData.append('conf', values.conf)
        formData.append('expressionMatrixFile', expressionMatrixFileList[0], 'segment.txt')
        formData.append('groupInformationFile', groupInformationFileList[0], 'marker.txt')
        formData.append('queryProteinListFile', queryProteinListFileList[0], 'ref.mat')

        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1])
        }


        try {
            const response = await axios.post(postGISTICTaskURL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 600000
            })
            onReset()
            setSubmissionStatus(true)
            setTaskUUID(response.data?.uuid)
            setTaskName(values.taskName)
            setIsSubmitting(false)
            showModal()
        } catch (error) {
            setSubmissionStatus(false)
            setIsSubmitting(false)
            showModal()
        }
    }

    return (
        <>
            <Form
                form={form}
                size="large"
                layout="horizontal"
                labelCol={{
                    span: 10,
                }}
                wrapperCol={{
                    span: 12,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    label={<CustomFormLabel text="Task Name"/>}
                    required
                    tooltip="User-defined task name."
                >
                    <Space align="baseline" size={48}>
                        <Form.Item
                            name="taskName"
                            noStyle
                            hasFeedback
                            rules={[
                                {
                                    type: 'string',
                                    max: 128,
                                    min: 1,
                                    required: true,
                                    message: 'Task Name is required',
                                },
                            ]}
                        >
                            <Input
                                style={{
                                    width: 500,
                                }}
                                placeholder="Please input"
                            />
                        </Form.Item>
                    </Space>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.taskType !== currentValues.taskType}
                >
                    <Form.Item
                        name="brlen"
                        label={<CustomFormLabel text="broad_len_cutoff"/>}
                        initialValue={0.5}
                        rules={[
                            {
                                required: true,
                                message: 'broad_len_cutoff is required.',
                            },
                            {
                                validator(_, value) {
                                    if (typeof value !== 'number' || isNaN(value)) {
                                        return Promise.reject(new Error('Value must be a number.'));
                                    }
                                    if (value <= 0 || value >= 1) {
                                        return Promise.reject(new Error('Value must be between 0 and 1 (exclusive).'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        tooltip="Threshold used to distinguish broad from focal events, given in units of fraction of chromosome arm."
                    >
                        <InputNumber
                            controls={false}
                            style={{
                                width: '500px'
                            }}
                        />
                    </Form.Item>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.taskType !== currentValues.taskType}
                >
                    <Form.Item
                        name="conf"
                        label={<CustomFormLabel text="conf_level"/>}
                        initialValue={0.90}
                        rules={[
                            {
                                required: true,
                                message: 'Confidence level is required.',
                            },
                            {
                                validator(_, value) {
                                    if (typeof value !== 'number' || isNaN(value)) {
                                        return Promise.reject(new Error('Value must be a valid number.'));
                                    }
                                    if (value <= 0 || value >= 1) {
                                        return Promise.reject(
                                            new Error('Value must be between 0 and 1 (exclusive).')
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        tooltip="Confidence level used to calculate the region containing a driver."
                    >
                        <InputNumber
                            controls={false}
                            style={{
                                width: '500px'
                            }}
                        />
                    </Form.Item>
                </Form.Item>

                <Form.Item
                    name="expressionMatrixFile"
                    label={
                        <CustomFormLabelWithDownload
                            text="Segmentation File"
                            toolTipTitle="Click to Download Demo Segmentation File."
                            file="expressionMatrix"
                            fileName="demo_expression_matrix.csv"
                        />
                    }
                    valuePropName="expressionMatrixFileList"
                    required
                    rules={[
                        () => ({
                            validator(_, value) {
                                if (
                                    value === undefined ||
                                    value.fileList.length === 0 ||
                                    value.file.type !== 'text/plain'
                                ) {
                                    return Promise.reject(new Error('You should provide a .txt file!'))
                                }
                                return Promise.resolve()
                            },
                        }),
                    ]}
                    tooltip=".txt, The segmentation file contains the segmented data for all the samples identified by GLAD, CBS, or some other segmentation algorithm. (See GLAD file format in the Genepattern file formats documentation.) It is a six column, tab-delimited file with an optional first line identifying the columns. Positions are in base pair units."
                >
                    <Upload
                        onRemove={(file) => {
                            setExpressionMatrixFileList([])
                        }}
                        beforeUpload={(file) => {
                            setExpressionMatrixFileList([file]);
                            return false;
                        }}
                        fileList={expressionMatrixFileList}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined/>}>Click to upload</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="groupInformationFile"
                    label={
                        <CustomFormLabelWithDownload
                            text="Markers File"
                            toolTipTitle="Click to Download Demo Markers File."
                            file="groupInformation"
                            fileName="demo_group_information.csv"
                        />
                    }
                    valuePropName="groupInformationFileList"
                    required
                    rules={[
                        () => ({
                            validator(_, value) {
                                if (
                                    value === undefined ||
                                    value.fileList.length === 0 ||
                                    value.file.type !== 'text/plain'
                                ) {
                                    return Promise.reject(new Error('You should provide a .txt file!'));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                    tooltip=".txt, The markers file identifies the marker positions used in the original dataset (before segmentation) for array or capture experiments. As of GISTIC release 2.0.23, the markers file is an optional input - if omitted, pseudo markers are generated as uniformly as possible using the maxspace input parameter."
                >
                    <Upload
                        onRemove={(file) => {
                            setGroupInformationFileList([])
                        }}
                        beforeUpload={(file) => {
                            setGroupInformationFileList([file])
                            return false;
                        }}
                        fileList={groupInformationFileList}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined/>}>Click to upload</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.taskType !== currentValues.taskType}
                >
                    <Form.Item
                        name="queryProteinListFile"
                        label={
                            <CustomFormLabelWithDownload
                                text="Reference Genome File"
                                toolTipTitle="Click to Donload Demo Reference Genome File"
                                file="queryProteinList"
                                fileName="demo_query_protein_list.csv"
                            />
                        }
                        valuePropName="queryProteinListFileList"
                        required
                        rules={[
                            () => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        value.fileList.length === 0 ||
                                        !value.file.name.endsWith('.mat')
                                    ) {
                                        return Promise.reject(new Error('You should provide a .mat file!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                        tooltip=".txt, The reference genome file contains information about the location of genes and cytobands on a given build of the genome. Reference genome files are created in MatlabTM and are not viewable with a text editor. The GISTIC 2.0 release has four reference genomes located in the refgenefiles directory: hg16.mat, hg17.mat, hg18.mat, and hg19.mat."
                    >
                        <Upload
                            onRemove={(file) => {
                                setQueryProteinListFileList([])
                            }}
                            beforeUpload={(file) => {
                                setQueryProteinListFileList([file]);
                                return false;
                            }}
                            fileList={queryProteinListFileList}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined/>}>Click to upload</Button>
                        </Upload>
                    </Form.Item>
                </Form.Item>

                <Form.Item label={null}>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: "center",
                            paddingTop: '16px',
                        }}
                        spacing={12}
                    >
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={isSubmitting}
                            style={{ width: '250px', flexShrink: 0 }}
                        >
                            Run
                        </Button>
                        <Button
                            danger
                            size="large"
                            htmlType="button"
                            onClick={onReset}
                            loading={isSubmitting}
                            style={{ width: '250px', flexShrink: 0 }}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Form.Item>
            </Form>
        </>
    );
}

const CustomFormLabel = ({ text }) => {
    return (
        <Span sx={{ fontSize: 24 }}>
            {text}
        </Span>
    )
}

const CustomFormLabelWithDownload = ({ text, toolTipTitle, file, fileName }) => {
    const handleDownload = (e) => {
        e.preventDefault()

        const fileUrl = `${''}?demoType=CCLE&file=${file}`;

        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    }

    return (
        <Stack direction="row" spacing={0.5}>
            <Span sx={{ fontSize: 24 }}>
                {text}
            </Span>
            <Tooltip
                title={toolTipTitle}
                placement="top"
            >
                <DownloadOutlined
                    style={{
                        fontSize: '14px',
                    }}
                    onClick={handleDownload}
                />
            </Tooltip>
        </Stack>
    )
}

export default SubmitForm
