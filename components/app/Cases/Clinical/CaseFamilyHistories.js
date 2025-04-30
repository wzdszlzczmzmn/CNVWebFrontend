import { Badge, Descriptions, Tree } from "antd"
import { useState } from "react"
import SplitterLayout from "../Shared/SplitterLayout"
import { DescriptionLabel } from "../Shared/DescriptionComponents"
import { EmptyState } from "../Shared/EmptyState"
import { Span } from "../../../styledComponents/styledHTMLTags"

const CaseFamilyHistories = ({ data }) => {
    const familyHistories = data['family_history']
    const [selectedItem, setSelectedItem] = useState(familyHistories[0]?.['family_history_id'])

    return (
        <>
            {
                familyHistories.length !== 0 ? (
                    <SplitterLayout
                        leftPanel={
                            <FamilyHistoriesTree
                                familyHistories={familyHistories}
                                selectedItem={selectedItem}
                                setSelectedItem={setSelectedItem}
                            />
                        }
                        rightPanel={
                            <DescriptionWrapper selectedItem={selectedItem} familyHistories={familyHistories}/>
                        }
                    />
                ) : (
                    <EmptyState description='No Family Histories'/>
                )
            }
        </>
    )
}

export const FamilyHistoriesTabContent = ({ data }) => {
    const familyHistoriesNum = data['family_history'].length

    return (
        <>
            <Span>Family Histories</Span>
            <Badge count={familyHistoriesNum} offset={[4, -3]} showZero/>
        </>
    )
}

const DescriptionWrapper = ({selectedItem, familyHistories}) => {
    const targetFamilyHistory = familyHistories.find(familyHistory => familyHistory['family_history_id'] === selectedItem)

    return <FamilyHistoriesDescription familyHistory={targetFamilyHistory}/>
}

const FamilyHistoriesDescription = ({ familyHistory }) => {
    const familyHistoriesDescriptionItems = createFamilyHistoriesDescriptionItems(familyHistory)

    return (
        <Descriptions
            bordered
            items={familyHistoriesDescriptionItems}
            column={1}
        />
    )
}

const FamilyHistoriesTree = ({ familyHistories, selectedItem, setSelectedItem }) => {
    const familyHistoriesTree = transformFamilyHistoriesToTree(familyHistories)

    const handelSelect = (selectedKeys) => {
        if (selectedKeys.length !== 0) {
            setSelectedItem(selectedKeys[0])
        }
    }

    return <Tree
        blockNode
        treeData={familyHistoriesTree}
        selectedKeys={[selectedItem]}
        defaultExpandAll
        onSelect={handelSelect}
    />
}

const createFamilyHistoriesDescriptionItems = (familyHistory) => [
    {
        key: 'familyHistoryID',
        label: <DescriptionLabel text={'Family History ID'}/>,
        children: familyHistory['submitter_id']
    },
    {
        key: 'familyHistoryUUID',
        label: <DescriptionLabel text={'Family History UUID'}/>,
        children: familyHistory['family_history_id']
    },
    {
        key: 'relationshipAgeAtDiagnosis',
        label: <DescriptionLabel text={'Relationship Age At Diagnosis'}/>,
        children: familyHistory['relationship_age_at_diagnosis']
    },
    {
        key: 'relationshipGender',
        label: <DescriptionLabel text={'Relationship Gender'}/>,
        children: familyHistory['relationship_gender']
    },
    {
        key: 'relationshipPrimaryDiagnosis',
        label: <DescriptionLabel text={'Relationship Primary Diagnosis'}/>,
        children: familyHistory['relationship_primary_diagnosis']
    },
    {
        key: 'relationshipType',
        label: <DescriptionLabel text={'Relationship Type'}/>,
        children: familyHistory['relationship_type']
    },
    {
        key: 'relativeWithCancerHistory',
        label: <DescriptionLabel text={'Relative With Cancer History'}/>,
        children: familyHistory['relative_with_cancer_history']
    }
]

const transformFamilyHistoriesToTree = (familyHistories) => [
    {
        title: 'Family Histories',
        key: 'familyHistories',
        selectable: false,
        children: familyHistories.map(familyHistory => ({
            title: familyHistory['submitter_id'],
            key: familyHistory['family_history_id']
        }))
    }
]

export default CaseFamilyHistories
