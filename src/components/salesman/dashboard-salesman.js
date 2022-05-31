import Head from "next/head";
import { useState, useEffect, useContext } from "react";
import { Box, Container, Grid, Select, MenuItem } from "@mui/material";
import { LatestOrders } from "../dashboard/latest-orders";
import { TasksProgress } from "../dashboard/tasks-progress";
import { ProductsList } from "../dashboard/products-list";
import { DashboardLayout } from "../dashboard-layout";
import { AppContext } from "../../context/AppContext";
import { getSales } from "../../utils/api/sales";
import { getSalesmanIndicator, getSalesmanIA } from "../../utils/api/salesman";
import { getClientIndicator } from "../../utils/api/clients";
import { getProducts } from "../../utils/api/products";
import { ClientsList } from "../dashboard/clients-list";
import { StatisticPanel } from "../statistics/statistic_panel";
import { getLocalStorage } from "../../utils/helpers/localStorage";
import { Filter } from "../filter";

const DashboardSalesman = ({
  pageSales,
  pageProducts,
  pageClients,
  handlePageChangeSales,
  handlePageChangeProducts,
  handlePageChangeClients,
  user,
}) => {
  const {
    isAdmin,
    clients,
    setClients,
    products,
    setProducts,
    loguedUser,
    setLoguedUser,
    sales,
    setSales,
    salesCount,
    setSalesCount,
  } = useContext(AppContext);

  const [tableSelected, setTableSelected] = useState("sales");
  const [salesmanIndicator, setSalesmanIndicator] = useState(null);
  const [salesPredicted, setSalesPredicted] = useState(null);
  const [salesMonth, setSalesMonth] = useState(null);
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState(null);
  const [filteredSales, setFilteredSales] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [filteredClients, setFilteredClients] = useState(null);

  useEffect(() => {
    setToken(getLocalStorage("token"));
  }, []);

  const handleFilter = async (query) => {
    let aux = "";
    console.log(query);
    Object.entries(query).forEach((element) => {
      aux = aux + `${element[0]}=${element[1]}&`;
    });
    console.log("aux", aux);

    if (tableSelected === "sales") {
      const { data, request } = await getSales(token, null, aux);
      if (request.ok) {
        setFilteredSales(data);
      }
    }

    if (tableSelected === "products") {
      const { data, request } = await getProducts(token, null, aux);
      if (request.ok) {
        setFilteredProducts(data);
      }
    }

    if (tableSelected === "clients") {
      const { data, request } = await getClientIndicator(token, null, aux);
      if (request.ok) {
        setFilteredClients(data);
      }
    }
  };

  const handleClear = () => {
    setFilteredClients(clients);
    setFilteredProducts(products);
    setFilteredSales(sales);
  };

  useEffect(() => {
    async function fetchData() {
      if (!sales) {
        const { data, request } = await getSales(
          token,
          null,
          `salesman=${loguedUser.salesman.salesman.id}`
        );
        console.log("entrando en orders");
        if (request.ok) {
          setSales({
            ...data,
            results: data.results.filter((sale) => sale.status === "COMPLETED"),
          });
          setSalesCount(data.count);
          setOrders({ ...data, results: data.results.filter((sale) => sale.status === "PENDING") });
          setFilteredSales(data);
        }
      }
      if (!products) {
        const { data, request } = await getProducts(token, null);
        if (request.ok) {
          setProducts(data);
          setFilteredProducts(data);
        }
      }
      if (!salesmanIndicator) {
        const { data, request } = await getSalesmanIndicator(
          token,
          loguedUser.salesman.salesman.id
        );
        if (request.ok) {
          setSalesmanIndicator(data);
        }
      }

      if (!salesPredicted) {
        const { data, request } = await getSalesmanIA(token, loguedUser.salesman.salesman.id);
        if (request.ok) {
          setSalesPredicted(data);
        }
      }

      if (!salesMonth) {
        const { data, request } = await getSales(
          token,
          null,
          `date_start=2022-02-01&date_end=2022-03-01&limit=1&salesman${loguedUser.salesman.salesman.id}`
        );
        if (request.ok) {
          setSalesMonth(data.count);
        }
      }

      if (!clients) {
        const { data, request } = await getClientIndicator(token, null);
        if (request.ok) {
          setClients(data);
          setFilteredClients(data);
        }
      }
    }
    fetchData();
  }, [token]);

  const handleChangeTable = (event) => {
    setTableSelected(event.target.value);
  };

  return (
    <>
      <DashboardLayout>
        <Head>
          <title>Dashboard Salesman| Material Kit</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth={false}>
            <Grid container spacing={3}>
              {salesmanIndicator && (
                <>
                  <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <StatisticPanel
                      title="Cantidad de ventas"
                      value={salesmanIndicator.purchases}
                    />
                  </Grid>
                  <Grid item xl={3} lg={3} sm={6} xs={12}>
                    <StatisticPanel
                      title="Venta mas alta"
                      value={`#${salesmanIndicator.biggest_sale}`}
                    />
                  </Grid>
                  <Grid item xl={3} lg={3} sm={6} xs={12}>
                    <TasksProgress
                      task="Cantidad de ventas esperadas"
                      goal={salesPredicted}
                      current={salesMonth}
                    />
                  </Grid>
                  <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <StatisticPanel
                      title="Cantidad de ventas estimadas"
                      value={Math.round(salesPredicted * 100) / 100}
                    />
                  </Grid>
                </>
              )}

              <Grid item lg={12} md={12} xl={9} xs={12}>
                <Grid item xl={3} lg={3} sm={6} xs={12}>
                  <Select
                    sx={{ border: "1px solid #ced4da", marginBottom: 1 }}
                    value={tableSelected}
                    onChange={handleChangeTable}
                  >
                    <MenuItem value={"sales"}>Ventas</MenuItem>
                    <MenuItem value={"orders"}>Ordenes de venta</MenuItem>
                    <MenuItem value={"products"}>Productos</MenuItem>
                    <MenuItem value={"clients"}>Clientes</MenuItem>
                  </Select>
                </Grid>

                {filteredSales && tableSelected === "sales" && (
                  <>
                    <Filter
                      fields={[{ title: "Factura", field: "id", type: "text" }]}
                      onFilter={handleFilter}
                      onClear={handleClear}
                    ></Filter>

                    <LatestOrders
                      sales={filteredSales}
                      handlePageChange={handlePageChangeSales}
                      page={pageSales}
                    />
                  </>
                )}

                {orders && tableSelected === "orders" && (
                  <LatestOrders
                    sales={orders}
                    handlePageChange={handlePageChangeSales}
                    page={pageSales}
                  />
                )}

                {filteredProducts && tableSelected === "products" && (
                  <>
                    <Filter
                      fields={[
                        { title: "Nombre", field: "name", type: "text" },
                        { title: "Categoria", field: "Category", type: "text" },
                      ]}
                      onFilter={handleFilter}
                      onClear={handleClear}
                    ></Filter>
                    <ProductsList
                      products={filteredProducts}
                      handlePageChange={handlePageChangeProducts}
                      page={pageProducts}
                    />
                  </>
                )}

                {filteredClients && tableSelected === "clients" && (
                  <>
                    <Filter
                      fields={[
                        { title: "Nombre", field: "name", type: "text" },
                        { title: "Cedula/Rif", field: "identity_card", type: "text" },
                      ]}
                      onFilter={handleFilter}
                      onClear={handleClear}
                    ></Filter>
                    <ClientsList
                      clients={filteredClients}
                      handlePageChange={handlePageChangeClients}
                      page={pageClients}
                    />
                  </>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </DashboardLayout>
    </>
  );
};

export { DashboardSalesman };
