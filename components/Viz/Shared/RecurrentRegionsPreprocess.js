import _ from "lodash"

export const preprocessRegions = (regions) => {
    const processedRegions = []
    for (const region of regions) {
        const boundary = parseRegionBoundary(region.boundaries)
        processedRegions.push({
            cytoband: region.cytoband,
            start: boundary.range[0],
            end: boundary.range[1],
            genes: region.genes,
            chromosome: boundary.chromosome
        })
    }

    return _.orderBy(
        processedRegions.sort((a, b) => a.start - b.start),
        [
            item => parseInt(item.chromosome.replace('chr', ''), 10),
            'start'
        ],
        ['asc', 'asc']
    )
}

const parseRegionBoundary = (boundary) => {
    const match = boundary.match(/chr([XY\d]+):(\d+)-(\d+)/)
    const chr = `chr${match[1]}`
    const start = parseInt(match[2])
    const end = parseInt(match[3])

    return {
        chromosome: chr,
        range: [start, end]
    }
}
