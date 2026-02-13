const db = idb.open("titan-db", 1, (upgradeDB) => {
  console.log("upgrading db");
  const store = upgradeDB.createObjectStore("rm-max", {
    keyPath: "id",
    autoIncrement: true,
  });

  // store.createIndex("deadline", "deadline");
});

async function addTask(taskData) {
  try {
    const mydb = await db;

    const tx = mydb.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    await store.add(taskData);

    await tx.complete;
    console.log("Task added successfully");
    return true;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
}

async function getAllTasks() {
  try {
    const mydb = await db;

    const tx = mydb.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");

    return await store.getAll();
  } catch (error) {
    console.error("Error retrieving tasks: ", error);
    return [];
  }
}

async function updateTask(updatedTask) {
  try {
    const mydb = await db;
    const tx = mydb.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    await store.put(updatedTask);

    await tx.complete;
    console.log("Task updated successfully");
    return true;
  } catch (error) {
    console.error("Update failed: ", error);
    return false;
  }
}

async function deleteTask(id) {
  try {
    const mydb = await db;
    const tx = mydb.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");

    await store.delete(id);

    await tx.complete;
    console.log("Task deleted successfully");
    return true;
  } catch (error) {
    console.error("Delete failed: ", error);
    return false;
  }
}
