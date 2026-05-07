import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, CircularProgress, Typography } from "@mui/material";
import { Product } from "../../app/models/product";
import { Link } from "react-router-dom";
import { useState } from "react";
import agent from "../../app/api/agent";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch } from "../../app/store/configureStore";
import { setBasket } from "../basket/basketSlice";
import { buildProductImagePath, formatCurrency } from "../../app/util/util";

interface Props {
    product : Product;
}
export default function ProductCard({product}: Props){
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    function addItem(){
      setLoading(true);
      agent.Basket.addItem(product, dispatch)
        .then(response=>{
          dispatch(setBasket(response.basket));
        })
        .catch(error=>console.log(error))
        .finally(()=>setLoading(false));
    }
    return (
        <Card sx={{
          height: '100%',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: 8
          }
        }}>
             <CardHeader avatar={
                <Avatar sx={{bgcolor: 'secondary.main'}}>
                    {product.name.charAt(0).toUpperCase()}
                </Avatar>
            }
            title={product.name}
            titleTypographyProps={{sx:{fontWeight:'bold', color: 'primary.main' }}}
            />
        <CardMedia
          sx={{
            height: 140,
            backgroundSize:'contain',
            transition: 'transform 180ms ease',
            '.MuiCard-root:hover &': {
              transform: 'scale(1.03)'
            }
          }}
          image={buildProductImagePath(product)}
          title={product.name}
        />
        <CardContent>
          <Typography gutterBottom color='secondary' variant="h5">
            {formatCurrency(product.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.productBrand} / {product.productType}
          </Typography>
        </CardContent>
        <CardActions>
        <LoadingButton
          loading={loading}
          onClick={addItem}
          size="small"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Add to cart
        </LoadingButton> 
          <Button component={Link} to={`/store/${product.id}`} size="small">View</Button>
        </CardActions>
        </Card>
    )
}
