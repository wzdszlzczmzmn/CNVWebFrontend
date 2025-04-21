export const stripChromosome = (chromosome) => chromosome.replace('chr', '')

export const chromosomeOrder = (chromosome, stripFunc = stripChromosome) => {
    const chrValue = stripFunc(chromosome)

    if (!isNaN(chrValue)) return parseInt(chrValue, 10)
    if (chrValue === 'X') return 23
    if (chrValue === 'Y') return 24
}

export const createChromosomeSorter = (order = 'asc', stripFunc = stripChromosome) => {
    return order === 'desc' ? (
        (a, b) => chromosomeOrder(b, stripFunc) - chromosomeOrder(a, stripFunc)
    ) : (
        (a, b) => chromosomeOrder(a, stripFunc) - chromosomeOrder(b, stripFunc)
    )
}
