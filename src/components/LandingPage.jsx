import { AppBar, Button, Container, Typography,Box } from "@mui/material"

const LandingPage = () => {
  return (
    <>
        <AppBar color="inherit" position="fixed" sx={{ width: '100%', padding: '10px 20px', boxShadow:'0',height:'70px' }}>
        <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily='sour gummy' fontSize={30}>
            Task Manager
            </Typography>

            <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography fontFamily='sour gummy' sx={{marginTop:1}}>Home</Typography>
                <Typography fontFamily='sour gummy' sx={{marginTop:1}}>About</Typography>
                <Typography fontFamily='sour gummy' sx={{marginTop:1}}>Contact</Typography>
                <Button variant="outlined"  sx={{backgroundImage: "linear-gradient(-45deg,#8306a5, #de96f2)",color:'white',borderStyle:'none', fontFamily: 'sour gummy',fontSize: '20px',borderRadius: '20px'}}>Signup</Button>
                <Button variant="contained" sx={{backgroundImage: "linear-gradient(-45deg,#8306a5, #de96f2)", fontFamily: 'sour gummy',fontSize: '20px',borderRadius: '20px'}}>Login</Button>
            </Box>
        </Container>
        </AppBar>
        <Container sx={{ height: 'calc(55vh - 70px)', width: '100vw', backgroundColor: 'white',marginBottom:'0',position:'relative',top:'80px',borderRadius: '50px',display:'flex' ,alignContent:'center',justifyContent:'space-between',alignItems:'center'}}>
            <Container sx={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <Typography variant="h3" fontFamily='sour gummy' >Organize Stuff</Typography>
                <Typography variant="p" fontFamily='sour gummy' >Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laboriosam eius modi expedita repellat omnis doloremque?</Typography>
            </Container>
            <img src="https://img.freepik.com/free-vector/isometric-time-management-concept-illustrated_52683-55534.jpg" alt="Image" width={300} height={300}/>
        </Container>

    </>
  )
}

export default LandingPage