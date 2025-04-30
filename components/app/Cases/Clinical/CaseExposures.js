import { EmptyState } from "../Shared/EmptyState"
import { Span } from "../../../styledComponents/styledHTMLTags"
import { Badge, Descriptions, Tree } from "antd"
import { useState } from "react"
import SplitterLayout from "../Shared/SplitterLayout"
import { DescriptionLabel } from "../Shared/DescriptionComponents"

const CaseExposures = ({ data }) => {
    const { exposures } = data
    const [selectedItem, setSelectedItem] = useState(exposures[0]?.['exposure_id'])

    return (
        <>
            {
                exposures.length !== 0 ? (
                    <SplitterLayout
                        leftPanel={
                            <ExposuresTree
                                exposures={exposures}
                                selectedItem={selectedItem}
                                setSelectedItem={setSelectedItem}
                            />
                        }
                        rightPanel={
                            <DescriptionWrapper selectedItem={selectedItem} exposures={exposures}/>
                        }
                    />
                ) : (
                    <EmptyState description='No Exposures'/>
                )
            }
        </>
    )
}

export const ExposuresTabContent = ({ data }) => {
    const exposuresNum = data['exposures'].length

    return (
        <>
            <Span>Exposures</Span>
            <Badge count={exposuresNum} offset={[4, -3]} showZero/>
        </>
    )
}

const DescriptionWrapper = ({selectedItem, exposures}) => {
    const targetExposure = exposures.find(exposure => exposure['exposure_id'] === selectedItem)

    return <ExposuresDescription exposure={targetExposure}/>
}

const ExposuresDescription = ({ exposure }) => {
    const exposuresDescriptionItems = createExposuresDescriptionItems(exposure)

    return (
        <Descriptions
            bordered
            items={exposuresDescriptionItems}
            column={1}
        />
    )
}

const ExposuresTree = ({ exposures, selectedItem, setSelectedItem }) => {
    const exposuresTree = transformExposuresToTree(exposures)

    const handleSelect = (selectedKeys) => {
        if (selectedKeys.length !== 0) {
            setSelectedItem(selectedKeys[0])
        }
    }

    return <Tree
        blockNode
        treeData={exposuresTree}
        selectedKeys={[selectedItem]}
        defaultExpandAll
        onSelect={handleSelect}
    />
}

const createExposuresDescriptionItems = (exposure) => [
    {
        key: 'exposureId',
        label: <DescriptionLabel text={'Exposure ID'}/>,
        children: exposure['submitter_id']
    },
    {
        key: 'exposureUUID',
        label: <DescriptionLabel text={'Exposure UUID'}/>,
        children: exposure['exposure_id']
    },
    {
        key: 'alcoholHistory',
        label: <DescriptionLabel text={'Alcohol History'}/>,
        children: exposure['alcohol_history']
    },
    {
        key: 'alcoholIntensity',
        label: <DescriptionLabel text={'Alcohol Intensity'}/>,
        children: exposure['alcohol_intensity']
    },
    {
        key: 'tobaccoSmokingStatus',
        label: <DescriptionLabel text={'Tobacco Smoking Status'}/>,
        children: exposure['tobacco_smoking_status']
    },
    {
        key: 'packYearsSmoked',
        label: <DescriptionLabel text={'Pack Years Smoked'}/>,
        children: exposure['pack_years_smoked']
    }
]

const transformExposuresToTree = (exposures) => [
    {
        title: 'Exposures',
        key: 'exposures',
        selectable: false,
        children: exposures.map(exposure => ({
            title: exposure['submitter_id'],
            key: exposure['exposure_id']
        }))
    }
]

export default CaseExposures
