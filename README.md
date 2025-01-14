# Globaldrop

[Globaldrop](https://globaldrop.me) is a way to share local files through your browser. The project is inspired by [Snapdrop](https://snapdrop.net) but extends its functionality to enable sharing outside of the local network.

The data exchange is performed via P2P connections, with server communication only used for the initial connection setup.

Devices on the local network are automatically detected. Devices from external networks must be added using the connection code.

This is **my first project using React and Node.js**. So, you've been **warned!**
This project was created as a learning exercise to explore React and Node.js technologies.

Globaldrop was built with the following technologies:
* React / shadcn / tailwindcss
* PeerJS
* Node.js

## Screenshots
<details open>
  <summary>Desktop</summary>

  ![Screenshot from a desktop browser with dark system preference](images/desktop-dark.png)
  ![Screenshot from a desktop browser with light system preference](images/desktop-light.png)
</details>
<details>
  <summary>Mobile</summary>

  ![Screenshot from a mobile browser with dark system preference](images/mobile-dark.png)
  ![Screenshot from a mobile browser with light system preference](images/mobile-light.png)
</details>

## Project Structure
The project is divided into a client project and a server project. These are located in the respective `gdclient` and `gdserver` directories.

