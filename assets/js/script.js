// FUNCTIONS
const indicatorRequest = async (indicator) => {
  try {
    const response = await fetch(`https://mindicador.cl/api/${indicator}`);
    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data.serie;
  } catch (error) {
    handleApiError(error);
  }
};

const handleApiError = (error) => {
  console.log(error);
  const converterText = document.getElementById("converter-text");
  converterText.innerHTML =
    "<p>Por favor, inténtelo nuevamente. Ocurrió un error.</p>";
  converterText.style.color = "red";
};

const createDataToChart = (dataArray) => {
  const dataArrayLast10 = dataArray.slice(0, 15);
  const labels = dataArrayLast10
    .map((dato) => getNewDateFormat(dato.fecha))
    .reverse();
  const data = dataArrayLast10.map((dato) => dato.valor).reverse();

  const datasets = [
    {
      label: "CANTIDAD EN CLP",
      borderColor: "#1c7e94",
      data,
    },
  ];

  return { labels, datasets };
};

const renderChart = (dataArray) => {
  const chart = Chart.getChart("indicator-chart");
  if (chart) {
    chart.destroy();
  }

  const data = createDataToChart(dataArray);
  const config = {
    type: "line",
    data,
  };

  new Chart("indicator-chart", config);
};

const getNewDateFormat = (date) => {
  const dateFormat = new Date(date);
  const day = dateFormat.getUTCDate();
  const month = dateFormat.getUTCMonth() + 1;
  return `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}`;
};

// Encuentra el botón de reinicio por su ID
const resetBtn = document.getElementById("reset-btn");

// Agrega un evento de clic al botón de reinicio
resetBtn.addEventListener("click", () => {
  // Limpia los campos y reinicia la interfaz
  converterInput.value = "";
  converterSelect.value = "dolar";
  converterText.innerHTML = "";
  chartContainer.innerHTML = "";
});

const getCurrencyFormat = (amount) =>
  amount.toLocaleString("es-CL", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const setDate = () => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const f = new Date();

  return `${diasSemana[f.getDay()]}, ${f.getDate()} de ${
    meses[f.getMonth()]
  } de ${f.getFullYear()}`;
};

// EVENTS
const converterInput = document.getElementById("converter-input");
const converterSelect = document.getElementById("converter-select");
const converterText = document.getElementById("converter-text");
const chartContainer = document.getElementById("chart-container");
const converterBtn = document.getElementById("converter-btn");

converterBtn.addEventListener("click", async () => {
  const inputValue = parseFloat(converterInput.value);
  const selectedCurrency = converterSelect.value;

  if (!Number.isNaN(inputValue) && inputValue > 0) {
    try {
      const dataArray = await indicatorRequest(selectedCurrency);
      const actualValue = parseFloat(dataArray[0].valor);
      const input = getCurrencyFormat(inputValue);
      const tasa = getCurrencyFormat(actualValue);
      const total = getCurrencyFormat(inputValue / actualValue);
      const currencyCodes = {
        dolar: "USD",
        euro: "EUR",
      };

      converterText.style.color = "black";
      converterText.innerHTML = `
                <p class="converter-text-clp"><span>${input}</span> CLP equivalen a:</p>
                <h3 class="converter-text-total">${total} ${
        currencyCodes[selectedCurrency]
      }</h3>
                <p class="converter-text-tasa">Tasa: <span>${tasa}</span> CLP - ${setDate()}</p>
            `;

      chartContainer.innerHTML = `
                <canvas id="indicator-chart"></canvas>
                <p class="chart-title"> 15 últimas variaciones de la moneda </p>
            `;

      renderChart(dataArray);
    } catch (error) {
      handleApiError(error);
    }
  } else {
    converterText.innerHTML = "<p>Ingrese un valor válido y mayor que cero</p>";
    converterText.style.color = "red";
  }
});
