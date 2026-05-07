import { Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useAppSelector } from "../../app/store/configureStore"
import BasketSummary from "../basket/BasketSummary";
import { buildProductImagePath, formatCurrency } from "../../app/util/util";

export default function Review(){
    const {basket} = useAppSelector(state=>state.basket);
    return (
        <>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {basket?.items.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.pictureUrl && (
                    <img src={buildProductImagePath(product)} alt="Product" width="50" height="50" />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
              </TableRow>
            ))}            
          </TableBody>
        </Table>
      </TableContainer>
      <BasketSummary />
    </>
    )
}
