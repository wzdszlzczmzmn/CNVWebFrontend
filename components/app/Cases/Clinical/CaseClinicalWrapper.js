import Box from "@mui/material/Box"
import { MainTitle } from "../Shared/Titles"
import CaseDemographic from "./CaseDemographic"
import { ConfigProvider, Tabs } from "antd"
import CaseDiagnosis, { DiagnosisTabContent } from "./CaseDiagnosis"
import CaseFamilyHistories, { FamilyHistoriesTabContent } from "./CaseFamilyHistories"
import CaseExposures, { ExposuresTabContent } from "./CaseExposures"
import CaseFollowUps, { FollowUpsLabelContent } from "./CaseFollowUps"

const CaseClinicalWrapper = ({ data }) => (
    <Box>
        <MainTitle>
            CLINICAL
        </MainTitle>
        <ClinicalTabs data={data}/>
    </Box>
)

const ClinicalTabs = ({ data }) => {
    const tabItems = createTabItems(data)

    return (
        <ConfigProvider
            theme={{
                components: {
                    Tabs: {
                        horizontalItemGutter: 4,
                        cardGutter: 12
                    }
                }
            }}
        >
            <Tabs
                defaultActiveKey="demographic"
                items={tabItems}
            />
        </ConfigProvider>
    )
}

const createTabItems = (data) => [
    {
        key: 'demographic',
        label: <TabLabel>Demographic</TabLabel>,
        children: <CaseDemographic data={data}/>
    },
    {
        key: 'diagnosis',
        label: (
            <TabLabel>
                <DiagnosisTabContent data={data}/>
            </TabLabel>
        ),
        children: <CaseDiagnosis data={data}/>
    },
    {
        key: 'familyHistories',
        label: (
            <TabLabel>
                <FamilyHistoriesTabContent data={data}/>
            </TabLabel>
        ),
        children: <CaseFamilyHistories data={data}/>
    },
    {
        key: 'exposures',
        label: (
            <TabLabel>
                <ExposuresTabContent data={data}/>
            </TabLabel>
        ),
        children: <CaseExposures data={data}/>
    },
    {
        key: 'followUps',
        label: (
            <TabLabel>
                <FollowUpsLabelContent data={data}/>
            </TabLabel>
        ),
        children: <CaseFollowUps data={data}/>
    }
]

const TabLabel = ({ children }) => (
    <Box sx={{ px: '16px', fontSize: '16px', fontWeight: 500 }}>
        {children}
    </Box>
)



export default CaseClinicalWrapper
