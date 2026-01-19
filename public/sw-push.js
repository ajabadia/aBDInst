self.addEventListener("push", (event) => {
    if (event.data) {
        const data = JSON.parse(event.data.text());
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon || "/icons/icon-192.png",
                data: { url: data.url || "/" }, // Pass deep link URL
            })
        );
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                const urlToOpen = event.notification.data.url || "/";
                for (const client of clientList) {
                    if (client.url === urlToOpen && "focus" in client)
                        return client.focus();
                }
                if (clients.openWindow) return clients.openWindow(urlToOpen);
            })
    );
});
