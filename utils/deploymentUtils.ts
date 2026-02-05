
export const calculateTotalDays = (deploymentDate: string, completionDate: string): number => {
    const startDate = new Date(deploymentDate);
    const endDate = new Date(completionDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
        return 0;
    }
    const timeDiff = endDate.getTime() - startDate.getTime();
    // A deployment on the same day is 1 day.
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return Math.max(1, totalDays);
};
