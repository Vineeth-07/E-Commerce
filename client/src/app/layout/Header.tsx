import { ShoppingCart } from "@mui/icons-material";
import { AppBar, Badge, Box, IconButton, List, ListItem, Switch, Toolbar, Typography } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector } from "../store/configureStore";
import SignedInMenu from "./SignedInMenu";

const navLinks = [
    {title: 'Home', path:'/'},
    {title: 'Store', path:'/store'}
]
const accountLinks = [
    {title: 'Login', path:'/login'},
    {title: 'Register', path:'/register'}
]
const navStyles = {
    color: "inherit",
    typography:"h6",
    textDecoration:"none",
    "&:hover":{
        color:"secondary.main"
    },
    "&:active":{
        color:"text.secondary"
    }
};
interface Props {
    darkMode: boolean;
    handleThemeChange:()=> void;
}
export default function Header({darkMode, handleThemeChange}: Props){
    const {basket} = useAppSelector(state=>state.basket);
    const {user} = useAppSelector(state=>state.account);
    const itemCount = basket?.items?.reduce((sum, item)=>sum+item.quantity, 0) || 0;

    return(
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundImage: 'linear-gradient(135deg, rgba(9,77,61,0.96), rgba(19,31,44,0.96))', backdropFilter: 'blur(12px)' }}>
            <Toolbar sx={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center"
            }}>
                <Box display='flex' alignItems='center'>
                    <Typography variant="h6" component={Link} to='/' sx={{ color: 'inherit', textDecoration: 'none', letterSpacing: 1.5 }}>
                        Sports Center
                    </Typography>
                <Switch checked={darkMode} onChange={handleThemeChange}/>
            </Box>
            <List sx={{display:'flex'}}>
                {navLinks.map(({title, path})=>(
                    <ListItem component={NavLink} to={path} key={path} sx={navStyles}>
                        {title}
                    </ListItem>
                ))}
            </List>
            <Box display='flex' alignItems='center'>
                <IconButton component={Link} to='/basket' size='large' edge='start' color='inherit' sx={{mr:2}}>
                    <Badge badgeContent={itemCount} color="secondary">
                        <ShoppingCart/>
                    </Badge>
                </IconButton>
                {user?(
                <SignedInMenu/>):(
                <List sx={{display:'flex'}}>
                    {accountLinks.map(({title, path})=>(
                        <ListItem component={NavLink} to={path} key={path} sx={navStyles}>
                            {title}
                        </ListItem>
                    ))}
                </List>
            )}                
            </Box>
            </Toolbar>
        </AppBar>
    )
}
