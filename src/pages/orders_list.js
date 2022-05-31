import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TableContainer,
} from "@mui/material";
import { AppContext } from "../context/AppContext";
import { DashboardLayout } from "../components/dashboard-layout";
import { getProducts } from "../utils/api/products";
import { SeverityPill } from "../components/severity-pill";
import { getSales } from "../utils/api/sales";
import { getLocalStorage } from "../utils/helpers/localStorage";

const OrderList = (props) => {
  const [ orders, setOrders ] = useState(null);
  const [page, setPage] = useState(0);
  const [token, setToken] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const aux = getLocalStorage("token");
    setToken(getLocalStorage("token"));
    if (!aux) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
        const { data, request } = await getSales(token, null);
        if (request.ok) {
          setOrders({...data, results: data.results.filter((sale) => sale.status === "PENDING")});
        }
      }

      if(!orders) {
        fetchData();
      }

  }, [token])

  const handlePageChange = async (event, newPage) => {
    const newUrl = newPage > page ? orders.next : orders.previous;
    setPage(newPage);
    const { data, request } = await getProducts(token, newUrl);
    setOrders(data);
  };

  const handleClick = (sale) => {
    router.push(`/sale_detail/${sale.id}`);
  }

  return (
    <DashboardLayout>
      <Card {...props}>
        <CardHeader title="Lista de Ordenes de venta" />
        <Box sx={{ width: "100%" }}>
          <TableContainer sx={{ maxHeight: "100%", width: "100%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Factura</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Vendedor</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders &&
                  orders.results.map((sale) => (
                    <TableRow hover key={sale.id}
                    onClick={() => handleClick(sale)}>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.income}</TableCell>
                      <TableCell>{sale.salesman.name}</TableCell>
                      <TableCell>{sale.client.name}</TableCell>
                      <TableCell>
                        <SeverityPill
                          color={
                            (sale.status.toLowerCase() === "completed" && "success") ||
                            (sale.status === "refunded" && "error") ||
                            "warning"
                          }
                        >
                          {sale.status}
                        </SeverityPill>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  {orders && (
                    <TablePagination
                      colSpan={3}
                      count={orders.count}
                      rowsPerPage={100}
                      onPageChange={handlePageChange}
                      page={page}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      }}
                    />
                  )}
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
          }}
        ></Box>
      </Card>
    </DashboardLayout>
  );
};

export default OrderList;

