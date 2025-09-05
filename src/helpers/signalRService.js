import { ref } from "vue";
import { useQuasar } from "quasar";
//import { EncryptStorage } from "storage-encryption";
import * as signalR from "@microsoft/signalr";
import { urlSistemas } from "src/boot/axios";

//const encryptStorage = new EncryptStorage("SECRET_KEY", "sessionStorage");
const onLine = ref(false);
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`http://sistema.ieenayarit.org:9270/hubUniverso`, {
    accessTokenFactory: () => localStorage.getItem("key"),
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export function useNotifications() {
  const $q = useQuasar();

  const startConnection = async () => {
    try {
      await connection.start();
      onLine.value = true;
      console.info("SignalR Connected.");
    } catch (err) {
      onLine.value = false;
      console.error("SignalR Connection Error: ", err);
      setTimeout(startConnection, 5000);
    }
  };

  const onReceiveNotification = () => {
    connection.on("notificarUsuario", (data) => {
      $q.notify({
        position: "top-right",
        message: data.titulo,
        icon: data.tipo == "I" ? "announcement" : "warning",
        color:
          data.tipo == "I" ? "purple" : data.tipo == "E" ? "red" : "orange",
        caption: data.sistema,
        actions: [
          {
            icon: "close",
            color: "white",
            round: true,
            handler: () => { },
          },
        ],
      });
    });
  };

  return { startConnection, onReceiveNotification, onLine };
}
