
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";

let hostelData = [];
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const getHostelData = () => {
        let cnt = 0;
        const dbref = ref(db);
    onValue(dbref, (snapshot) => {
        hostelData = [];
        snapshot.forEach((h) => {
            hostelData.push(h.val());
        });
            console.log('Hostel data',hostelData);
            while(!hostelData){
                    cnt++;
                    console.log('Cnt',cnt);
            }
            initializeDefaultFilters();
    });
        
}
                // Get total beds, occupied beds, and available beds
const getBedStats = () => {
    let bedStatsData = [];
    let totalBeds = 0, occupiedBeds = 0, availableBeds = 0;
    Object.values(hostelData["Hostel details"]).forEach(hostel => {
        let bedStats = {hostel: "" , totalBeds:0 , occupiedBeds:0 , availableBeds:0};
        Object.values(hostel.rooms).forEach(floor => {
            Object.values(floor).forEach(room_type => {
                if (!room_type.roomCount){
                    room_type.roomCount = 0;
                };
                if(!room_type.bedsAvailable){
                    room_type.bedsAvailable = 0;
                }
                // console.log(room_type.bedsAvailable, room_type.roomCount);
                totalBeds += room_type.bedsAvailable;

                Object.values(room_type).forEach(floor_rooms => {
                    Object.values(floor_rooms).forEach(ac_typr => {
                       Object.values(ac_typr).forEach(room_no => {
                            Object.values(room_no).forEach(beds => {
                                Object.values(beds).forEach(bed => {
                                    if (bed.status === "booked") {
                                        occupiedBeds++;
                                    }
                                });
                               
                            });
            });
            });
            });
            });
        });
        availableBeds = totalBeds - occupiedBeds;
        bedStats.hostel = hostel.hostelName;
        bedStats.totalBeds = totalBeds;
        bedStats.occupiedBeds = occupiedBeds;
        bedStats.availableBeds = availableBeds;
        bedStatsData.push(bedStats);
    });
    
    
    // console.log('Bedstats value',totalBeds, occupiedBeds, availableBeds);
    return bedStatsData;
};


// Get occupied bed types with count
const getOccupiedBedTypes = () => {
    const result = {}; // To hold the final data
    const bedTypes = {}; // To store bed type counts

    Object.entries(hostelData['Hostel details']).forEach(([hostelName, hostel]) => {
        Object.values(hostel.rooms).forEach(floor => {
            Object.values(floor).forEach(sharingType => {
                Object.values(sharingType.rooms).forEach(acType => {
                    Object.values(acType).forEach(room => {
                        Object.entries(room.beds).forEach(([bedKey, bed]) => {
                            if (bed.status === "booked") {
                                const key = `${sharingType.roomType}, ${room.ac}, ${room.bathroom}`;
                                if (!bedTypes[key]) {
                                    bedTypes[key] = 1;
                                } else {
                                    bedTypes[key]++;
                                }
                            }
                        });
                    });
                });
            });
        });

        // Add the hostel name and bed types to the result
        result[hostelName] = { bedTypes };
    });

    return result;
};

// Payments stats
function derivePaymentStats(startDate, endDate) { 
    
    let paymentStats = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth() + 1; // Months are 0-indexed
    const currentYear = currentDate.getUTCFullYear();

    Object.values(hostelData['User details']).forEach(user => {
        const bookings = user['Bookings'];
        let hostelName = "";
        let stats = {
            totalPayments: { count: 0, amount: 0 },
            completedPayments: { count: 0, amount: 0 },
            vacatedPayments: { count: 0, amount: 0 },
            pendingPayments: { count: 0, amount: 0 },
            paymentMethods: {} // e.g., { "Credit Card": 1, "PayPal": 1 }
        };
        if (bookings) {
            // console.log(bookings);
            Object.values(bookings).forEach(booking => {
                const paymentDetails = booking?.RoomDetails?.PaymentDetails;
                let hasCurrentMonthPayment = false;

                hostelName = booking.RoomDetails?.hostelName;
                

                if (paymentDetails) {
                    Object.values(paymentDetails).forEach(payment => {
                        const paymentDate = new Date(payment.paymentDate);
                        const paymentMonth = paymentDate.getUTCMonth() + 1;
                        const paymentYear = paymentDate.getUTCFullYear();

                        // Check if this payment falls in the current month
                        if (paymentMonth === currentMonth && paymentYear === currentYear) {
                            hasCurrentMonthPayment = true;
                        }

                        // Check if payment date is within range
                        if (paymentDate >= start && paymentDate <= end) {
                            stats.totalPayments.count += 1;
                            stats.totalPayments.amount += parseFloat(payment.paymentAmount);

                            if (booking.RoomDetails.status === "Updated") {
                                stats.completedPayments.count += 1;
                                stats.completedPayments.amount += parseFloat(payment.paymentAmount);
                            } else if (booking.RoomDetails.status === "vacated") {
                                stats.vacatedPayments.count += 1;
                                stats.vacatedPayments.amount += parseFloat(payment.paymentAmount);
                            }

                            // Track payment methods
                            if (payment.paymentMode) {
                                if (!stats.paymentMethods[payment.paymentMode]) {
                                    stats.paymentMethods[payment.paymentMode] = 1;
                                } else {
                                    stats.paymentMethods[payment.paymentMode]++;
                                }
                            }
                        }
                    });
                }

                // If no current month payment details exist, consider as pending
                if (!hasCurrentMonthPayment) {
                    stats.pendingPayments.count++;
                    stats.pendingPayments.amount += parseFloat(booking.RoomDetails.totalAmount);
                }
            });
        }

        if (hostelName) {
            paymentStats.push({hostelName,stats});
        }
    });

    return paymentStats;
}


// User stats
const getUserStats = () => {
    const statsByHostel = {};

    Object.values(hostelData["User details"]).forEach(user => {
        let hostelName = "Unknown Hostel";

        // Attempt to get the hostelName from the user's bookings, if present
        const bookings = user["Bookings"];
        if (bookings) {
            Object.values(bookings).forEach(booking => {
                hostelName = booking?.RoomDetails?.hostelName || "Unknown Hostel";

                // Initialize stats for this hostel if not already present
                if (!statsByHostel[hostelName]) {
                    statsByHostel[hostelName] = {
                        totalUser: 0,
                        vacationUser: 0,
                        occupiedUser: 0,
                        leftUser: 0,
                    };
                }

                // Check for vacation users
                const vacationDetails = booking?.RoomDetails?.Vacation;
                if (vacationDetails) {
                    const vacationStatus = vacationDetails.vacationstatus;
                    if (vacationStatus.includes("yes")) {
                        statsByHostel[hostelName].vacationUser += 1;
                    }
                }

                // Check for left users
                if (booking?.RoomDetails?.roomCheckoutDateByAdmin) {
                    statsByHostel[hostelName].leftUser += 1;
                }
            });
        }

        // Ensure hostel stats are initialized even if no bookings exist
        if (!statsByHostel[hostelName]) {
            statsByHostel[hostelName] = {
                totalUser: 0,
                vacationUser: 0,
                occupiedUser: 0,
                leftUser: 0,
            };
        }

        // Increment total users for this hostel
        statsByHostel[hostelName].totalUser += 1;

        // If the user has bookings, consider them as occupied
        if (bookings) {
            statsByHostel[hostelName].occupiedUser += 1;
        }
    });

    return statsByHostel;
};



// Extra food options
const getExtraFoodOptions = () => {
    const foodOptionsByHostel = {};

    Object.values(hostelData["User details"]).forEach(user => {
        const bookings = user["Bookings"];

        if (bookings) {
            Object.values(bookings).forEach(booking => {
                const hostelName = booking?.RoomDetails?.hostelName || "Unknown Hostel";

                // Initialize hostel in foodOptionsByHostel if not already present
                if (!foodOptionsByHostel[hostelName]) {
                    foodOptionsByHostel[hostelName] = {};
                }

                const extraFoodOptionDetails = booking?.RoomDetails?.extras;

                if (extraFoodOptionDetails) {
                    extraFoodOptionDetails.forEach(extraFood => {
                        const foodName = extraFood.foodName;

                        // Initialize food item count for the hostel if not already present
                        if (!foodOptionsByHostel[hostelName][foodName]) {
                            foodOptionsByHostel[hostelName][foodName] = 0;
                        }

                        // Increment the count for the food item
                        foodOptionsByHostel[hostelName][foodName] += 1;
                    });
                }
            });
        }
    });

    return foodOptionsByHostel;
};


// Financial stats
const calculateExpenses = (startDate, endDate) => {
    const expensesData = hostelData["Hostel expenses"];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalExpenses = 0;
    let expensesByHostel = {};

    for (const hostelName in expensesData) {
        const hostelExpenses = expensesData[hostelName];

        // Initialize expenses data for the hostel
        if (!expensesByHostel[hostelName]) {
            expensesByHostel[hostelName] = {
                totalExpenses: 0,
                categoryWiseExpenses: {},
            };
        }

        for (const dateRange in hostelExpenses) {
            const expenseEntry = hostelExpenses[dateRange];
            const expenseStartDate = new Date(expenseEntry.date.from);
            const expenseEndDate = new Date(expenseEntry.date.to);

            // Check if expense falls within the selected date range
            if (
                (expenseStartDate >= start && expenseStartDate <= end) ||
                (expenseEndDate >= start && expenseEndDate <= end)
            ) {
                const expenses = expenseEntry.expenses;

                for (const category in expenses) {
                    for (const subCategory in expenses[category]) {
                        const expenseItems = expenses[category][subCategory];

                        expenseItems.forEach(item => {
                            const cost = parseFloat(item.cost || "0");

                            // Update total expenses for the hostel
                            totalExpenses += cost;
                            expensesByHostel[hostelName].totalExpenses += cost;

                            // Update category-wise expenses for the hostel
                            if (!expensesByHostel[hostelName].categoryWiseExpenses[category]) {
                                expensesByHostel[hostelName].categoryWiseExpenses[category] = 0;
                            }
                            expensesByHostel[hostelName].categoryWiseExpenses[category] += cost;
                        });
                    }
                }
            }
        }
    }

    return {
        totalExpenses,
        expensesByHostel,
    };
};


function calculateHostelData(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
  
    const hostelDataSummary = {};
  
    // Process user payments
    Object.values(hostelData['User details']).forEach(user => {
        if (user.Bookings) {
            Object.values(user.Bookings).forEach(booking => {
                const hostelName = booking.RoomDetails?.hostelName || "Unknown Hostel";
                if (!hostelDataSummary[hostelName]) {
                    hostelDataSummary[hostelName] = {
                        totalIncome: 0,
                        totalExpenses: 0,
                        paymentData: [],
                        expenseData: [],
                    };
                }

                if (booking.RoomDetails.PaymentDetails) {
                    Object.values(booking.RoomDetails.PaymentDetails).forEach(payment => {
                        const paymentDate = new Date(payment.paymentDate);
                        if (paymentDate >= from && paymentDate <= to) {
                            const paymentAmount = Number(payment.paymentAmount);
                            hostelDataSummary[hostelName].totalIncome += paymentAmount;
                            hostelDataSummary[hostelName].paymentData.push({
                                type: "Income",
                                date: paymentDate.toISOString().split("T")[0],
                                amount: paymentAmount,
                                description: `Payment by ${user.userFullName}`,
                                transactionId: payment.paymenttransId,
                            });
                        }
                    });
                }
            });
        }
    });
  
    // Process expenses
    Object.entries(hostelData['Hostel expenses']).forEach(([hostelName, expenses]) => {
        if (!hostelDataSummary[hostelName]) {
            hostelDataSummary[hostelName] = {
                totalIncome: 0,
                totalExpenses: 0,
                paymentData: [],
                expenseData: [],
            };
        }

        Object.values(expenses).forEach(expense => {
            const expenseFromDate = new Date(expense.date.from);
            const expenseToDate = new Date(expense.date.to);
            if (
                (expenseFromDate >= from && expenseFromDate <= to) ||
                (expenseToDate >= from && expenseToDate <= to)
            ) {
                Object.values(expense.expenses).forEach(category => {
                    Object.values(category).forEach(subCategory => {
                        Object.values(subCategory).forEach(values => {
                            const cost = Number(values.cost);
                            hostelDataSummary[hostelName].totalExpenses += cost;
                            hostelDataSummary[hostelName].expenseData.push({
                                type: "Expense",
                                date: expense.date.from,
                                amount: cost,
                                description: values.subCategory || "Others",
                            });
                        });
                    });
                });
            }
        });
    });

    // Calculate net profit for each hostel
    for (const hostelName in hostelDataSummary) {
        const data = hostelDataSummary[hostelName];
        data.netProfit = data.totalIncome - data.totalExpenses;
    }
  
    return hostelDataSummary;
}


        let bedStatsChartInstance, userStatsChartInstance, occupiedBedChartInstance, paymentStatsChartInstance, financialStatsChartInstance;

        function destroyChart(chartInstance) {
            if (chartInstance) {
                chartInstance.destroy();
            }
        }

        function getDataOutput(startDate, endDate) {
            return {
                bedStats: getBedStats(),
                occupiedBedTypes: getOccupiedBedTypes(),
                paymentStats: derivePaymentStats(startDate, endDate),
                userStats: getUserStats(),
                extraFoodOptions: getExtraFoodOptions(),
                financialStats: calculateExpenses(startDate, endDate),
                hostelData: calculateHostelData(startDate, endDate)
            };
        }

        function initializeDefaultFilters() {
            // getHostelData();
            console.log('Hostel data',hostelData);
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

            document.getElementById('start-date').value = startOfMonth;
            document.getElementById('end-date').value = endOfMonth;

            const dataOutput = getDataOutput(startOfMonth, endOfMonth);
            console.log('DATA OUTPUT', dataOutput);
            renderCharts(dataOutput);
        }

        function filterData() {
            const selectedHostel = document.getElementById('hostel-name').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;

            const dataOutput = getDataOutput(startDate, endDate);

            const filteredData = {
                bedStats: selectedHostel === 'all' ? dataOutput.bedStats : dataOutput.bedStats.filter(item => item.hostel === selectedHostel),
                occupiedBedTypes: selectedHostel === 'all' ? dataOutput.occupiedBedTypes : { [selectedHostel]: dataOutput.occupiedBedTypes[selectedHostel] },
                paymentStats: selectedHostel === 'all' ? dataOutput.paymentStats : dataOutput.paymentStats.filter(item => item.hostelName === selectedHostel),
                userStats: selectedHostel === 'all' ? dataOutput.userStats : { [selectedHostel]: dataOutput.userStats[selectedHostel] },
                extraFoodOptions: selectedHostel === 'all' ? dataOutput.extraFoodOptions : { [selectedHostel]: dataOutput.extraFoodOptions[selectedHostel] },
                financialStats: {
                    ...dataOutput.financialStats,
                    expensesByHostel: selectedHostel === 'all' ? dataOutput.financialStats.expensesByHostel : { [selectedHostel]: dataOutput.financialStats.expensesByHostel[selectedHostel] }
                },
                hostelData: selectedHostel === 'all' ? dataOutput.hostelData : { [selectedHostel]: dataOutput.hostelData[selectedHostel] }
            };

            renderCharts(filteredData);
        }

        function renderCharts(filteredData) {
            // Destroy previous Chart instances if they exist
            destroyChart(bedStatsChartInstance);
            destroyChart(userStatsChartInstance);
            destroyChart(occupiedBedChartInstance);
            destroyChart(paymentStatsChartInstance);
            destroyChart(financialStatsChartInstance);

            // Render Bed Stats Chart
            const bedStatsCtx = document.getElementById('bedStatsChart').getContext('2d');
            const bedLabels = filteredData.bedStats.map(item => item.hostel);
            const totalBeds = filteredData.bedStats.map(item => item.totalBeds);
            const occupiedBeds = filteredData.bedStats.map(item => item.occupiedBeds);
            const availableBeds = filteredData.bedStats.map(item => item.availableBeds);
            bedStatsChartInstance = new Chart(bedStatsCtx, {
                type: 'bar',
                data: {
                    labels: bedLabels,
                    datasets: [
                        { label: 'Total Beds', data: totalBeds, backgroundColor: '#007bff' },
                        { label: 'Occupied Beds', data: occupiedBeds, backgroundColor: '#dc3545' },
                        { label: 'Available Beds', data: availableBeds, backgroundColor: '#28a745' }
                    ]
                }
            });

            // Render User Stats Chart
            const userStatsCtx = document.getElementById('userStatsChart').getContext('2d');
            const userLabels = Object.keys(filteredData.userStats);
            const userVacation = userLabels.map(hostel => (filteredData.userStats[hostel]?.vacationUser || 0));
            const userOccupied = userLabels.map(hostel => (filteredData.userStats[hostel]?.occupiedUser || 0));
            const userLeft = userLabels.map(hostel => (filteredData.userStats[hostel]?.leftUser || 0));

            userStatsChartInstance = new Chart(userStatsCtx, {
                type: 'bar',
                data: {
                    labels: userLabels,
                    datasets: [
                        { label: 'Vacation', data: userVacation, backgroundColor: '#ffc107' },
                        { label: 'Occupied', data: userOccupied, backgroundColor: '#007bff' },
                        { label: 'Left', data: userLeft, backgroundColor: '#6c757d' }
                    ]
                }
            });

            // Render Occupied Bed Types Chart
            const occupiedBedTypes = filteredData.occupiedBedTypes[Object.keys(filteredData.occupiedBedTypes)[0]] || {};
            const occupiedLabels = Object.keys(occupiedBedTypes.bedTypes || {});
            const occupiedData = Object.values(occupiedBedTypes.bedTypes || {});
            const occupiedBedCtx = document.getElementById('occupiedBedChart').getContext('2d');
            occupiedBedChartInstance = new Chart(occupiedBedCtx, {
                type: 'pie',
                data: {
                    labels: occupiedLabels,
                    datasets: [{
                        label: 'Occupied Beds',
                        data: occupiedData,
                        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ff9f40', '#ffcd56']
                    }]
                }
            });

            // Render Payment Stats Chart
            const paymentStatsCtx = document.getElementById('paymentStatsChart').getContext('2d');

    // Aggregate or filter payment stats based on the selected hostels
    const paymentStatArrays = filteredData.paymentStats.map(item => item.stats);
    
    // Aggregate the stats based on the selection of hostels
    const aggregatedStats = paymentStatArrays.reduce((acc, curr) => {
        acc.totalPayments.amount += curr.totalPayments?.amount || 0;
        acc.completedPayments.amount += curr.completedPayments?.amount || 0;
        acc.vacatedPayments.amount += curr.vacatedPayments?.amount || 0;
        acc.pendingPayments.amount += curr.pendingPayments?.amount || 0;
        return acc;
    }, {
        totalPayments: { amount: 0 },
        completedPayments: { amount: 0 },
        vacatedPayments: { amount: 0 },
        pendingPayments: { amount: 0 }
    });

    // Render the payment stats chart using the aggregated data
    paymentStatsChartInstance = new Chart(paymentStatsCtx, {
        type: 'bar',
        data: {
            labels: ['Total Payments', 'Completed', 'Vacated', 'Pending'],
            datasets: [{
                label: 'Payments',
                data: [
                    aggregatedStats.totalPayments.amount,
                    aggregatedStats.completedPayments.amount,
                    aggregatedStats.vacatedPayments.amount,
                    aggregatedStats.pendingPayments.amount
                ],
                backgroundColor: ['#28a745', '#007bff', '#dc3545', '#ffc107']
            }]
        }
    });

            // Render Financial Stats Chart
            const financialStatsCtx = document.getElementById('financialStatsChart').getContext('2d');
            const financialHostels = Object.keys(filteredData.hostelData);
            const datasets = financialHostels.map((hostel, idx) => {
                const financialData = filteredData.hostelData[hostel] || {};
                const colors = ['#007bff', '#28a745', '#dc3545']; // Add more colors if needed
                return {
                    label: `Income - ${hostel}`,
                    data: [financialData.totalIncome || 0, financialData.totalExpenses || 0, financialData.netProfit || 0],
                    borderColor: colors[idx % colors.length],
                    backgroundColor: colors[idx % colors.length],
                    fill: false
                };
            });

            financialStatsChartInstance = new Chart(financialStatsCtx, {
                type: 'line',
                data: {
                    labels: ['Income', 'Expenses', 'Profit'],
                    datasets: datasets
                }
            });

            // Render Financial Breakdown Table
            const financialBreakdownTable = document.getElementById('financialBreakdownTable');
            const expenseHostelKeys = Object.keys(filteredData.financialStats.expensesByHostel);
            financialBreakdownTable.innerHTML = expenseHostelKeys.map(hostelKey => {
                const expensesByHostel = filteredData.financialStats.expensesByHostel[hostelKey] || {};
                return Object.entries(expensesByHostel?.categoryWiseExpenses || {}).map(([category, amount]) => `
                    <tr>
                        <td>${category} (${hostelKey})</td>
                        <td>$${amount.toFixed(2)}</td>
                    </tr>
                `).join('');
            }).join('');

            // Aggregate and Render Income Breakdown Table
            const incomeBreakdownTable = document.getElementById('incomeBreakdownTable');
            const allPaymentDetails = financialHostels.flatMap(hostel => (filteredData.hostelData[hostel]?.paymentData || []));
            incomeBreakdownTable.innerHTML = allPaymentDetails.map(detail => `
                <tr>
                    <td>${detail.date}</td>
                    <td>${detail.description}</td>
                    <td>$${detail.amount.toFixed(2)}</td>
                    <td>${detail.transactionId}</td>
                </tr>
            `).join('');

            // Render Extra Food Options Table
            const foodOptionsTable = document.getElementById('foodOptionsTable');
const foodDataExists = filteredData.extraFoodOptions || {};

if (foodDataExists) {

    // Generate table rows content
    const foodOptionsContent = Object.entries(filteredData.extraFoodOptions).map(
        ([hostel, options]) => {
            if (options && typeof options === 'object') {
                return Object.entries(options).map(
                    ([item, count]) => `
                        <tr>
                            <td>${hostel}</td>
                            <td>${item}</td>
                            <td>${count}</td>
                        </tr>
                    `
                ).join(''); // Join each row for this hostel
            } else {
                return ''; // If no valid options, return an empty string
            }
        }
    ).join(''); // Join the rows from all hostels into a single string

    // Insert the generated rows into the table
    foodOptionsTable.innerHTML = foodOptionsContent;
} else {
    foodOptionsTable.innerHTML = '<tr><td colspan="3">No food options available</td></tr>';
}

        }

        // document.addEventListener('DOMContentLoaded', getHostelData);
window.addEventListener("load", getHostelData);
  
