const root = process.env.NEXT_PUBLIC_API_URL;

export const postCasesURL = `${root}/cnvdata/cases`
export const postGenesURL = `${root}/cnvdata/genes`
export const postGLCNSRenderingURL = `${root}/cnvdata/GLCNS-render`
export const postPloidyStairstepRenderURL = `${root}/cnvdata/Ploidy-Stairstep-render`
export const postEmbeddingAnalyseRenderURL = `${root}/cnvdata/Embedding-Analyse-render`

export const postGISTICTaskURL = `${root}/analysis/gistic_task_submit`
