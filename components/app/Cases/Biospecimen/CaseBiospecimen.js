import { EmptyState } from "../Shared/EmptyState"
import { Descriptions, Tree } from "antd"
import SplitterLayout from "../Shared/SplitterLayout"
import { useState } from "react"
import { DescriptionLabel } from "../Shared/DescriptionComponents"
import { sample } from "lodash"

const CaseBiospecimen = ({ data }) => {
    const { samples } = data
    const [selectedItem, setSelectedItem] = useState(
        {
            key: samples[0]?.['sample_id'],
            type: 'sample'
        }
    )

    return (
        <>
            {
                samples.length !== 0 ? (
                    <SplitterLayout
                        leftPanel={
                            <SamplesTree
                                samples={samples}
                                selectedItem={selectedItem}
                                setSelectedItem={setSelectedItem}
                            />
                        }
                        rightPanel={
                            <DescriptionWrapper selectedItem={selectedItem} samples={samples} />
                        }
                    />
                ) : (
                    <EmptyState description='No Biospecimen'/>
                )
            }
        </>
    )
}

const DescriptionWrapper = ({ selectedItem, samples }) => {
    if (selectedItem.type === 'sample') {
        const targetSample = samples.find(sample => sample['sample_id'] === selectedItem.key)

        return <SampleDescription sample={targetSample}/>
    } else if (selectedItem.type === 'portion') {
        const targetPortion = samples.flatMap(
            sample => sample['portions']
        ).find(
            portion => portion['portion_id'] === selectedItem.key
        )

        return <PortionDescription portion={targetPortion}/>
    } else if (selectedItem.type === 'analyte') {
        const targetAnalyte = samples.flatMap(
            sample => sample['portions']
        ).flatMap(
            portion => portion['analytes']
        ).find(
            analyte => analyte['analyte_id'] === selectedItem.key
        )

        return <AnalyteDescription analyte={targetAnalyte}/>
    } else if (selectedItem.type === 'slide') {
        const targetSlide = samples.flatMap(
            sample => sample['portions']
        ).flatMap(
            portion => portion['slides']
        ).find(
            slide => slide['slide_id'] === selectedItem.key
        )

        return <SlideDescription slide={targetSlide}/>
    } else if (selectedItem.type === 'aliquot') {
        const targetAliquot = samples.flatMap(
            sample => sample['portions']
        ).flatMap(
            portion => portion['analytes']
        ).flatMap(
            analyte => analyte['aliquots']
        ).find(
            aliquot => aliquot['aliquot_id'] === selectedItem.key
        )

        return <AliquotDescription aliquot={targetAliquot}/>
    }else {
        return <></>
    }
}

const SampleDescription = ({ sample }) => {
    const sampleDescriptionItems = createSampleDescriptionItems(sample)

    return (
        <Descriptions
            bordered
            items={sampleDescriptionItems}
            column={1}
        />
    )
}

const PortionDescription = ({ portion }) => {
    const portionDescriptionItems = createPortionDescriptionItems(portion)

    return (
        <Descriptions
            bordered
            items={portionDescriptionItems}
            column={1}
        />
    )
}

const AnalyteDescription = ({ analyte }) => {
    const analyteDescriptionItems = createAnalyteDescriptionItems(analyte)

    return (
        <Descriptions
            bordered
            items={analyteDescriptionItems}
            column={1}
        />
    )
}

const SlideDescription = ({ slide }) => {
    const slideDescriptionItems = createSlideDescriptionItems(slide)

    return (
        <Descriptions
            bordered
            items={slideDescriptionItems}
            column={1}
        />
    )
}

const AliquotDescription = ({ aliquot }) => {
    const aliquotDescriptionItems = createAliquotDescriptionItems(aliquot)

    return (
        <Descriptions
            bordered
            items={aliquotDescriptionItems}
            column={1}
        />
    )
}

const SamplesTree = ({ samples, selectedItem, setSelectedItem }) => {
    const samplesTree = transformSamplesToTree(samples)
    const defaultExpandedKeys = samples.map(sample => sample['sample_id'])

    const handleSelect = (selectedKeys, e) => {
        if (selectedKeys.length !== 0) {
            setSelectedItem(
                {
                    key: e.selectedNodes[0].key,
                    type: e.selectedNodes[0].type
                }
            )
        }
    }

    return <Tree
        blockNode
        treeData={samplesTree}
        selectedKeys={[selectedItem.key]}
        defaultExpandedKeys={defaultExpandedKeys}
        onSelect={handleSelect}
    />
}

const createSampleDescriptionItems = (sample) => [
    {
        key: 'sampleId',
        label: <DescriptionLabel text={'Sample ID'} />,
        children: sample['submitter_id'],
    },
    {
        key: 'sampleUUID',
        label: <DescriptionLabel text={'Sample UUID'} />,
        children: sample['sample_id'],
    },
    {
        key: 'tissueType',
        label: <DescriptionLabel text={'Tissue Type'} />,
        children: sample['tissue_type'],
    },
    {
        key: 'tumorDescriptor',
        label: <DescriptionLabel text={'Tumor Descriptor'} />,
        children: sample['tumor_descriptor'],
    },
    {
        key: 'specimenType',
        label: <DescriptionLabel text={'Specimen Type'} />,
        children: sample['specimen_type'],
    },
    {
        key: 'preservationMethod',
        label: <DescriptionLabel text={'Preservation Method'} />,
        children: sample['preservation_method'],
    },
    {
        key: 'tumorCodeId',
        label: <DescriptionLabel text={'Tumor Code ID'} />,
        children: sample['tumor_code_id'],
    },
    {
        key: 'shortestDimension',
        label: <DescriptionLabel text={'Shortest Dimension'} />,
        children: sample['shortest_dimension'],
    },
    {
        key: 'intermediateDimension',
        label: <DescriptionLabel text={'Intermediate Dimension'} />,
        children: sample['intermediate_dimension'],
    },
    {
        key: 'longestDimension',
        label: <DescriptionLabel text={'Longest Dimension'} />,
        children: sample['longest_dimension'],
    },
    {
        key: 'pathologyReportUUID',
        label: <DescriptionLabel text={'Pathology Report UUID'} />,
        children: sample['pathology_report_uuid'],
    },
    {
        key: 'currentWeight',
        label: <DescriptionLabel text={'Current Weight'} />,
        children: sample['current_weight'],
    },
    {
        key: 'initialWeight',
        label: <DescriptionLabel text={'Initial Weight'} />,
        children: sample['initial_weight'],
    },
    {
        key: 'timeBetweenClampingAndFreezing',
        label: <DescriptionLabel text={'Time Between Clamping And Freezing'} />,
        children: sample['time_between_clamping_and_freezing'],
    },
    {
        key: 'timeBetweenExcisionAndFreezing',
        label: <DescriptionLabel text={'Time Between Excision And Freezing'} />,
        children: sample['time_between_excision_and_freezing'],
    },
    {
        key: 'daysToSampleProcurement',
        label: <DescriptionLabel text={'Days To Sample Procurement'} />,
        children: sample['days_to_sample_procurement'],
    },
    {
        key: 'freezingMethod',
        label: <DescriptionLabel text={'Freezing Method'} />,
        children: sample['freezing_method'],
    },
    {
        key: 'daysToCollection',
        label: <DescriptionLabel text={'Days To Collection'} />,
        children: sample['days_to_collection'],
    },
    {
        key: 'portions',
        label: <DescriptionLabel text={'Portions'}/>,
        children: sample['portions'].length
    }
]

const createPortionDescriptionItems = (portion) => [
    {
        key: 'portionId',
        label: <DescriptionLabel text={'Portion ID'} />,
        children: portion['submitter_id'],
    },
    {
        key: 'portionUUID',
        label: <DescriptionLabel text={'Portion UUID'} />,
        children: portion['portion_id'],
    },
    {
        key: 'portionNumber',
        label: <DescriptionLabel text={'Portion Number'} />,
        children: portion['portion_number'],
    },
    {
        key: 'weight',
        label: <DescriptionLabel text={'Weight'} />,
        children: portion['weight'],
    },
    {
        key: 'isFfpe',
        label: <DescriptionLabel text={'Is Ffpe'} />,
        children: portion['is_ffpe'],
    },
    {
        key: 'analytes',
        label: <DescriptionLabel text={'Analytes'} />,
        children: portion['analytes'].length
    },
    {
        key: 'slides',
        label: <DescriptionLabel text={'Slides'} />,
        children: portion['slides'].length
    }
]

const createAnalyteDescriptionItems = (analyte) => [
    {
        key: 'analyteId',
        label: <DescriptionLabel text={'Analyte ID'} />,
        children: analyte['submitter_id'],
    },
    {
        key: 'analyteUUID',
        label: <DescriptionLabel text={'Analyte UUID'} />,
        children: analyte['analyte_id'],
    },
    {
        key: 'analyteType',
        label: <DescriptionLabel text={'Analyte Type'} />,
        children: analyte['analyte_type'],
    },
    {
        key: 'wellNumber',
        label: <DescriptionLabel text={'Well Number'} />,
        children: analyte['well_number'],
    },
    {
        key: 'amount',
        label: <DescriptionLabel text={'Amount'} />,
        children: analyte['amount'],
    },
    {
        key: 'a260A280Ratio',
        label: <DescriptionLabel text={'A260 A280 Ratio'} />,
        children: analyte['a260_a280_ratio'],
    },
    {
        key: 'concentration',
        label: <DescriptionLabel text={'Concentration'} />,
        children: analyte['concentration'],
    },
    {
        key: 'spectrophotometerMethod',
        label: <DescriptionLabel text={'Spectrophotometer Method'} />,
        children: analyte['spectrophotometer_method'],
    },
    {
        key: 'aliquots',
        label: <DescriptionLabel text={'Aliquots'}/>,
        children: analyte['aliquots'].length
    }
]

const createSlideDescriptionItems = (slide) => [
    {
        key: 'slideId',
        label: <DescriptionLabel text={'Slide ID'} />,
        children: slide['submitter_id'],
    },
    {
        key: 'slideUUID',
        label: <DescriptionLabel text={'Slide UUID'} />,
        children: slide['slide_id'],
    },
    {
        key: 'percentTumorNuclei',
        label: <DescriptionLabel text={'Percent Tumor Nuclei'} />,
        children: slide['percent_tumor_nuclei'],
    },
    {
        key: 'percentMonocyteInfiltration',
        label: <DescriptionLabel text={'Percent Monocyte Infiltration'} />,
        children: slide['percent_monocyte_infiltration'],
    },
    {
        key: 'percentNormalCells',
        label: <DescriptionLabel text={'Percent Normal Cells'} />,
        children: slide['percent_normal_cells'],
    },
    {
        key: 'percentStromalCells',
        label: <DescriptionLabel text={'Percent Stromal Cells'} />,
        children: slide['percent_stromal_cells'],
    },
    {
        key: 'percentEosinophilInfiltration',
        label: <DescriptionLabel text={'Percent Eosinophil Infiltration'} />,
        children: slide['percent_eosinophil_infiltration'],
    },
    {
        key: 'percentLymphocyteInfiltration',
        label: <DescriptionLabel text={'Percent Lymphocyte Infiltration'} />,
        children: slide['percent_lymphocyte_infiltration'],
    },
    {
        key: 'percentNeutrophilInfiltration',
        label: <DescriptionLabel text={'Percent Neutrophil Infiltration'} />,
        children: slide['percent_neutrophil_infiltration'],
    },
    {
        key: 'sectionLocation',
        label: <DescriptionLabel text={'Section Location'} />,
        children: slide['section_location'],
    },
    {
        key: 'percentGranulocyteInfiltration',
        label: <DescriptionLabel text={'Percent Granulocyte Infiltration'} />,
        children: slide['percent_granulocyte_infiltration'],
    },
    {
        key: 'percentNecrosis',
        label: <DescriptionLabel text={'Percent Necrosis'} />,
        children: slide['percent_necrosis'],
    },
    {
        key: 'percentInflamInfiltration',
        label: <DescriptionLabel text={'Percent Inflammatory Infiltration'} />,
        children: slide['percent_inflam_infiltration'],
    },
    {
        key: 'numberProliferatingCells',
        label: <DescriptionLabel text={'# Proliferating Cells'} />,
        children: slide['number_proliferating_cells'],
    },
    {
        key: 'percentTumorCells',
        label: <DescriptionLabel text={'Percent Tumor Cells'} />,
        children: slide['percent_tumor_cells'],
    }
]

const createAliquotDescriptionItems = (aliquot) => [
    {
        key: 'aliquotId',
        label: <DescriptionLabel text={'Aliquot ID'} />,
        children: aliquot['submitter_id'],
    },
    {
        key: 'aliquotUUID',
        label: <DescriptionLabel text={'Aliquot UUID'} />,
        children: aliquot['aliquot_id'],
    },
    {
        key: 'sourceCenter',
        label: <DescriptionLabel text={'Source Center'} />,
        children: aliquot['source_center'],
    },
    {
        key: 'amount',
        label: <DescriptionLabel text={'Amount'} />,
        children: aliquot['amount'],
    },
    {
        key: 'concentration',
        label: <DescriptionLabel text={'Concentration'} />,
        children: aliquot['concentration'],
    },
    {
        key: 'analyteType',
        label: <DescriptionLabel text={'Analyte Type'} />,
        children: aliquot['analyte_type'],
    }
]

const transformSamplesToTree = (samples) => [
    {
        title: 'SAMPLES',
        key: 'samples',
        selectable: false,
        children: samples.map(sample => ({
            title: sample['submitter_id'],
            key: sample['sample_id'],
            type: 'sample',
            children: mapPortions(sample)
        }))
    }
]

const mapAliquots = (analyte) => {
    if (!analyte['aliquots'] || analyte['aliquots'].length === 0) return []

    return [
        {
            title: 'ALIQUOTS',
            key: `${analyte['analyte_id']}-aliquots`,
            selectable: false,
            children: analyte['aliquots'].map((aliquot) => ({
                title: aliquot['submitter_id'],
                key: aliquot['aliquot_id'],
                type: 'aliquot',
            })),
        },
    ]
}

const mapAnalytes = (portion) => {
    if (!portion['analytes'] || portion['analytes'].length === 0) return []

    return [
        {
            title: 'ANALYTES',
            key: `${portion['portion_id']}-analytes`,
            selectable: false,
            children: portion['analytes'].map((analyte) => ({
                title: analyte['submitter_id'],
                key: analyte['analyte_id'],
                type: 'analyte',
                children: mapAliquots(analyte),
            })),
        },
    ]
}

const mapSlides = (portion) => {
    if (!portion['slides'] || portion['slides'].length === 0) return []

    return [
        {
            title: 'SLIDES',
            key: `${portion['portion_id']}-slides`,
            selectable: false,
            children: portion['slides'].map((slide) => ({
                title: slide['submitter_id'],
                key: slide['slide_id'],
                type: 'slide',
            })),
        },
    ];
};

const mapPortions = (sample) => {
    if (!sample['portions'] || sample['portions'].length === 0) return []

    return [
        {
            title: 'PORTIONS',
            key: `${sample['sample_id']}-portions`,
            selectable: false,
            children: sample['portions'].map((portion) => ({
                title: portion['submitter_id'],
                key: portion['portion_id'],
                type: 'portion',
                children: [
                    ...mapAnalytes(portion),
                    ...mapSlides(portion)
                ],
            })),
        },
    ]
}

export default CaseBiospecimen
