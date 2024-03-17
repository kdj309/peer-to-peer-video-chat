import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { red } from "@mui/material/colors";
import Divider from '@mui/material/Divider';

export default function UserDrawer({ users, open, toggleDrawer }) {
  return (
    <Drawer anchor="right" open={open} onClose={toggleDrawer}>
      <Box sx={{ width: "100%", maxWidth: 360 }}>
        <h3 className="p-2 m-2">People</h3>
        <Divider />
        <nav aria-label="main mailbox folders">
          <List>
            {users.map((u,i) => (
              <ListItem disablePadding key={i}>
                <ListItemButton>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: red[600] }}>
                      {u[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={u} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </nav>
      </Box>
    </Drawer>
  );
}
