import { EmptyState } from "../Shared/EmptyState"
import { Badge, Descriptions, Tree } from "antd"
import { Divider } from 'antd'
import { Span } from "../../../styledComponents/styledHTMLTags"
import { DescriptionLabel } from "../Shared/DescriptionComponents"
import SplitterLayout from "../Shared/SplitterLayout"
import { useState } from "react"

const CaseDiagnosis = ({ data }) => {
    const { diagnosis } = data
    const [selectedItem, setSelectedItem] = useState(
        {
            key: diagnosis[0]?.['diagnosis_id'],
            type: 'diagnosis'
        }
    )

    return (
        <>
            {
                diagnosis.length !== 0 ? (
                    <SplitterLayout
                        leftPanel={
                            <DiagnosisTree
                                diagnosis={diagnosis}
                                selectedItem={selectedItem}
                                setSelectedItem={setSelectedItem}
                            />
                        }
                        rightPanel={
                            <DescriptionWrapper diagnosis={diagnosis} selectedItem={selectedItem} />
                        }
                    />
                ) : (
                    <EmptyState description='No Diagnosis'/>
                )
            }
        </>
    )
}

export const DiagnosisTabContent = ({ data }) => {
    const { diagnosis } = data
    const diagnosisNum = diagnosis.length
    let treatmentNum = 0

    if (diagnosisNum > 0) {
        diagnosis.forEach(diagnosis => {
            treatmentNum += diagnosis.treatments.length
        })
    }

    return (
        <>
            <Span>Diagnoses</Span>
            <Badge count={diagnosisNum} offset={[4, -3]} showZero/>
            <Divider type='vertical' style={{ borderColor: 'rgb(0, 0, 0, 0.4)', height: '18px', marginLeft: '14px' }}/>
            <Span>Treatments</Span>
            <Badge count={treatmentNum} offset={[4, -3]} showZero/>
        </>
    )
}

const DescriptionWrapper = ({ selectedItem, diagnosis }) => {
    if (selectedItem.type === 'diagnosis') {
        const targetDiagnosis = diagnosis.find(item => item['diagnosis_id'] === selectedItem.key)

        return <DiagnosisDescription diagnosis={targetDiagnosis}/>
    } else {
        let targetTreatment = diagnosis.flatMap(
            item => item.treatments
        ).find(
            treatment => treatment['treatment_id'] === selectedItem.key
        )

        return <TreatmentDescription treatment={targetTreatment}/>
    }
}

const DiagnosisDescription = ({ diagnosis }) => {
    const diagnosisDescriptionItems = createDiagnosisDescriptionItems(diagnosis)

    return (
        <Descriptions
            bordered
            items={diagnosisDescriptionItems}
            column={1}
        />
    )
}

const TreatmentDescription = ({ treatment }) => {
    const treatmentDescriptionItems = createTreatmentDescriptionItems(treatment)

    return (
        <Descriptions
            bordered
            items={treatmentDescriptionItems}
            column={1}
        />
    )
}

const DiagnosisTree = ({ diagnosis, selectedItem, setSelectedItem }) => {
    const diagnosisTree = transformDiagnosisToTree(diagnosis)
    const defaultExpandedKeys = diagnosis.map(diag => diag['diagnosis_id'])

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
        treeData={diagnosisTree}
        selectedKeys={[selectedItem.key]}
        defaultExpandedKeys={defaultExpandedKeys}
        onSelect={handleSelect}
    />
}

const createDiagnosisDescriptionItems = (diagnosis) => [
    {
        key: 'diagnosisId',
        label: <DescriptionLabel text={'Diagnosis ID'}/>,
        children: diagnosis['submitter_id']
    },
    {
        key: 'diagnosisUUID',
        label: <DescriptionLabel text={'Diagnosis UUID'}/>,
        children: diagnosis['diagnosis_id']
    },
    {
        key: 'classificationOfTumor',
        label: <DescriptionLabel text={'Classification Of Tumor'}/>,
        children: diagnosis['classification_of_tumor']
    },
    {
        key: 'ageAtDiagnosis',
        label: <DescriptionLabel text={'Age At Diagnosis'}/>,
        children: diagnosis['age_at_diagnosis']
    },
    {
        key: 'daysToLastFollowUp',
        label: <DescriptionLabel text={'Days To Last Follow Up'}/>,
        children: diagnosis['days_to_last_follow_up']
    },
    {
        key: 'daysToLastKnownDiseaseStatus',
        label: <DescriptionLabel text={'Days To Last Known Disease Status'}/>,
        children: diagnosis['days_to_last_known_disease_status']
    },
    {
        key: 'daysToRecurrence',
        label: <DescriptionLabel text={'Days To Recurrence'}/>,
        children: diagnosis['days_to_recurrence']
    },
    {
        key: 'lastKnownDiseaseStatus',
        label: <DescriptionLabel text={'Last Known Disease Status'}/>,
        children: diagnosis['last_known_disease_status']
    },
    {
        key: 'morphology',
        label: <DescriptionLabel text={'Morphology'}/>,
        children: diagnosis['morphology']
    },
    {
        key: 'primaryDiagnosis',
        label: <DescriptionLabel text={'Primary Diagnosis'}/>,
        children: diagnosis['primary_diagnosis']
    },
    {
        key: 'priorMalignancy',
        label: <DescriptionLabel text={'Prior Malignancy'}/>,
        children: diagnosis['prior_malignancy']
    },
    {
        key: 'SynchronousMalignancy',
        label: <DescriptionLabel text={'Synchronous Malignancy'}/>,
        children: diagnosis['synchronous_malignancy']
    },
    {
        key: 'progressionOrRecurrence',
        label: <DescriptionLabel text={'Progression Or Recurrence'}/>,
        children: diagnosis['progression_or_recurrence']
    },
    {
        key: 'siteOfResectionOrBiopsy',
        label: <DescriptionLabel text={'Site Of Resection Or Biopsy'}/>,
        children: diagnosis['site_of_resection_or_biopsy']
    },
    {
        key: 'Tissue Or Organ Of Origin',
        label: <DescriptionLabel text={'Tissue Or Organ Of Origin'}/>,
        children: diagnosis['tissue_or_organ_of_origin']
    },
    {
        key: 'Tumor Grade',
        label: <DescriptionLabel text={'Tumor Grade'}/>,
        children: diagnosis['tumor_grade']
    }
]

const createTreatmentDescriptionItems = (treatment) => [
    {
        key: 'treatmentId',
        label: <DescriptionLabel text={'Treatment ID'}/>,
        children: treatment['submitter_id']
    },
    {
        key: 'treatmentUUID',
        label: <DescriptionLabel text={'Treatment UUID'}/>,
        children: treatment['submitter_id']
    },
    {
        key: 'therapeuticAgents',
        label: <DescriptionLabel text={'Therapeutic Agents'}/>,
        children: treatment['therapeutic_agents']
    },
    {
        key: 'treatmentIntentType',
        label: <DescriptionLabel text={'Treatment Intent Type'}/>,
        children: treatment['treatment_intent_type']
    },
    {
        key: 'treatmentOrTherapy',
        label: <DescriptionLabel text={'Treatment or Therapy'}/>,
        children: treatment['treatment_or_therapy']
    },
    {
        key: 'daysToTreatmentStart',
        label: <DescriptionLabel text={'Days to Treatment Start'}/>,
        children: treatment['days_to_treatment_start']
    }
]

const transformDiagnosisToTree = (diagnosis) => [
    {
        title: 'Diagnoses',
        key: 'diagnoses',
        selectable: false,
        children: diagnosis.map(diag => {
            const diagnosisNode = {
                title: diag['submitter_id'],
                key: diag['diagnosis_id'],
                type: 'diagnosis',
                children: []
            };

            if (Array.isArray(diag['treatments']) && diag['treatments'].length > 0) {
                diagnosisNode.children.push({
                    title: 'Treatments',
                    key: `${diag['diagnosis_id']}-treatments`,
                    selectable: false,
                    children: diag['treatments'].map(treat => ({
                        title: treat['submitter_id'],
                        key: treat['treatment_id'],
                        type: 'treatment'
                    }))
                });
            }

            return diagnosisNode
        })
    }
]

export default CaseDiagnosis
