import { Badge, Button, Descriptions, Empty, Input, message } from "antd"
import Stack from "@mui/material/Stack"
import Box from "@mui/material/Box"
import { H6, Span } from "../../styledComponents/styledHTMLTags"
import { SearchOutlined } from "@ant-design/icons"
import axios from "axios"
import { useState } from "react"

const TaskQuery = ({}) => {
    const [taskUUID, setTaskUUID] = useState("");
    const [taskInformation, setTaskInformation] = useState(null)

    const handleUUIDChange = (e) => {
        setTaskUUID(e.target.value)
    }

    const handleSearch = async () => {
        try {
            const response = await axios.get(`${''}`, {
                params: {
                    taskUUID: taskUUID
                }
            })

            setTaskInformation(response.data)
        } catch (error) {
            setTaskInformation(null)

            if (error) {
                if (error.code === 'ERR_BAD_REQUEST'){
                    message.error('Please Enter a Correct UUID!')
                } else {
                    message.error(error.message)
                }
            } else {
                message.error("Please check the UUID you submit.")
            }

        }
    }

    return (
        <Stack spacing={1} sx={{alignItems: "center"}}>
            <H6 sx={{fontSize: '40px', paddingBottom: '48px', paddingTop: '32px'}}>
                Task Query
            </H6>
            <Stack direction="row" spacing={3} sx={{alignItems: "center"}}>
                <Span sx={{fontSize: '24px', fontWeight: '500'}}>UUID:</Span>
                <Input
                    placeholder="Please Enter Task UUID..."
                    allowClear
                    size="large"
                    style={{
                        width: '700px',
                        borderRadius: '18px',
                    }}
                    value={taskUUID}
                    onChange={handleUUIDChange}
                />
                <Button
                    type="primary"
                    size="large"
                    icon={<SearchOutlined/>}
                    style={{
                        borderRadius: '18px',
                    }}
                    // onClick={handleSearch}
                >
                    Search
                </Button>
            </Stack>
            <Box sx={{paddingTop: '60px', width: '100%'}}>
                <TaskInformationDetail taskInformation={taskInformation} handleSearch={handleSearch}/>
            </Box>
        </Stack>
    )
}

const TaskInformationDetail = ({taskInformation, handleSearch}) => {
    return (
        <Box sx={{
            border: '1px solid #1677FF',
            borderRadius: '10px',
            padding: '32px 32px'
        }}
        >
            {
                taskInformation === null ?
                    <TaskEmpty/>
                    :
                    <TaskDetail taskInformation={taskInformation} handleSearch={handleSearch} />
            }
        </Box>
    )
}

const TaskEmpty = () => {
    return (
        <Stack sx={{alignItems: "center", height: '450px', justifyContent: 'center'}}>
            <Empty/>
        </Stack>
    )
}

const TaskDetail = ({taskInformation, handleSearch}) => {
    const router = useRouter()

    const handleNavigate = () => {
        router.push(`/result?resultId=${taskInformation.uuid}`)
    }

    return (
        <Stack spacing={2}>
            <H6 sx={{fontSize: '28px', fontWeight: '500', paddingBottom: '12px'}}>
                Task Information:
            </H6>
            <Box sx={{padding: '0px 32px'}}>
                <InformationDescriptions taskInformation={taskInformation}/>
            </Box>
            <Stack
                direction="row"
                spacing={4}
                sx={{
                    justifyContent: 'space-around',
                    paddingTop: '16px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                }}
            >
                <Button
                    size="large"
                    style={{width: '400px'}}
                    onClick={() => handleSearch(taskInformation.uuid)}
                >
                    Refresh Task Status
                </Button>
                <Button
                    type="primary"
                    size="large"
                    style={{width: '400px'}}
                    disabled={taskInformation.status !== 'S'}
                    onClick={() => handleNavigate()}
                >
                    View Task Detail
                </Button>
            </Stack>
        </Stack>
    )
}

const statusMap = {
    'R': 'Running',
    'P': 'Pending',
    'S': 'Success',
    'F': 'Failed'
}

const typeMap = {
    'A': 'NA Statistics',
    'B': 'NA Statistics + NA Classification',
    'C': 'NA Statistics + NA Classification + NA-assisted PPI analysis'
}

const statusBadgeMap = {
    'Running': <Badge status="processing" text="Running"/>,
    'Success': <Badge status="success" text="Success"/>,
    'Pending': <Badge status="default" text="Pending"/>,
    'Failed': <Badge status="error" text="Failed"/>
}

const generateTaskInformationItems = (taskInformation) => {
    const taskInformationItems = []

    taskInformationItems.push({
        key: 'TaskName',
        label: 'Task Name',
        children: taskInformation['name'],
        span: 2
    })

    taskInformationItems.push({
        key: 'TaskUUID',
        label: 'Task UUID',
        children: taskInformation['uuid'],
        span: 2
    })

    taskInformationItems.push({
        key: 'Status',
        label: 'Status',
        children: (
            taskInformation['status'] === 'P' ?
                <Stack direction="row" spacing={3} sx={{alignItems: 'center'}}>
                    {statusBadgeMap[statusMap[taskInformation['status']]]}
                    <Button
                        style={{
                            backgroundColor: '#E47443',
                            color: 'rgb(255, 255, 255, 0.95)',
                            border: '1px solid #E47443',
                            borderRadius: '20px'
                        }}
                    >
                        Pending Queue Position: {Number.parseInt(taskInformation['position']) + 1}
                    </Button>
                </Stack>
                :
                statusBadgeMap[statusMap[taskInformation['status']]]
        ),
        span: 2
    })

    taskInformationItems.push({
        key: 'TaskType',
        label: 'Task Type',
        children: typeMap[taskInformation['type']],
        span: 2
    })

    taskInformationItems.push({
        key: 'CreateTime',
        label: 'Create Time',
        children: taskInformation['create_time'],
        span: 1
    })

    taskInformationItems.push({
        key: 'FinishTime',
        label: 'Finish Time',
        children: taskInformation['finish_time'],
        span: 1
    })

    taskInformationItems.push({
        key: 'GroupName',
        label: 'Group Name',
        children: taskInformation['group_name'],
        span: 1
    })

    if (taskInformation.type === 'B') {
        taskInformationItems.push({
            key: 'K',
            label: 'K',
            children: taskInformation['k'],
            span: 1
        })
        taskInformationItems.push({
            key: 'TH',
            label: 'TH',
            children: taskInformation['th'],
            span: 1
        })
        taskInformationItems.push({
            key: 'Group',
            label: 'Group',
            children: taskInformation['grp'],
            span: 1
        })
    } else if (taskInformation.type === 'C') {
        taskInformationItems.push({
            key: 'Reward',
            label: 'Reward',
            children: taskInformation['reward'],
            span: 1
        })
        taskInformationItems.push({
            key: 'Penalty',
            label: 'Penalty',
            children: taskInformation['penalty'],
            span: 1
        })
        taskInformationItems.push({
            key: 'Group',
            label: 'Group',
            children: taskInformation['grp'],
            span: 1
        })
    }

    return taskInformationItems
}

export const InformationDescriptions = ({taskInformation}) => {
    const taskInformationItems = generateTaskInformationItems(taskInformation)

    return (
        <Descriptions
            bordered
            items={taskInformationItems}
            column={2}
        />
    )
}

export default TaskQuery
