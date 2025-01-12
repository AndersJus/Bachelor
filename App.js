import * as React from 'react';
import { View, Text, StyleSheet, Button, StatusBar, TextInput, Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, createContext, useContext, useEffect } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { Agenda } from "react-native-calendars";
import { format } from 'date-fns';
import { GiftedChat } from "react-native-gifted-chat";
import SearchableDropdown from "react-native-searchable-dropdown";
import DateTimePicker from '@react-native-community/datetimepicker';

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const addUser = (user) => {
    setUsers([user]);
  };

  const setUser = (user) => {
    setCurrentUser(user);
  };

  const clearUsers = () => {
    setUsers([]);
    setCurrentUser(null);
  };

  


  return (
    <UsersContext.Provider value={{ users, setUser, currentUser, addUser, clearUsers, userId, setUserId }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  return useContext(UsersContext);
}

const MiniMenu = ({ navigation }) => {
  const handleJournalPress = () => navigation.navigate("Journal Screen");
  const handleDoctorPress = () => navigation.navigate("Doctor Screen");
  const handleProfilePress = () => navigation.navigate("Profile Screen");
  const handleAIChatPress = () => navigation.navigate("AI Chat Screen");
  return (
    <View style={{ paddingTop: "10%" }}>
      <View style={styles.topMiniMenuItems}>
        <TouchableOpacity style={styles.iconMiniMenu} onPress={handleJournalPress}>
          <FontAwesomeIcon icon={faBookOpen} size={50} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconMiniMenu} onPress={handleDoctorPress}>
          <FontAwesomeIcon icon={faComment} size={50} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconMiniMenu} onPress={handleProfilePress}>
          <FontAwesomeIcon icon={faUser} size={50} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconMiniMenu} onPress={handleAIChatPress}>
          <FontAwesomeIcon icon={faRobot} size={50} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


function WelcomeScreen({ navigation }) {
  const logInClickHandler = () => { navigation.navigate("Log In Screen") }
  const signUpClickHandler = () => { navigation.navigate("Sign Up Screen") }

  return (
    <View style={styles.defaultApplicationBackgroundColor}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome to (NAME)</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.body}>This is your personal application for
          tracking and keeping in touch with your health.</Text>
      </View>
      <View style={styles.logInButton}>
        <Button title='Log In' onPress={logInClickHandler} />
      </View>
      <View style={styles.signUpButton}>
        <Button title='Sign Up' onPress={signUpClickHandler} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function LogInScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setUserPassword] = useState("");

  const { setUser } = useUsers();


  async function attemptLogin(username, password) {
    const url = "http://192.168.1.55:5000/users";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const manager = json.find(
        (manager) => manager.username === username && manager.password === password
      );

      const user = json.find(
        (user) => user.username === username && user.password === password
      );
      return user || manager || null;
    }
    catch (error) {
      console.error(error.message);
      return null;
    }
  }


  const handleLogin = async () => {

    const user = await attemptLogin(username, password);
  
    console.log("Role:", user.role, typeof user.role);
    if (user.role === "user") {
      setUser(user); // Save user data to context
      navigation.navigate("Home Screen");
    }
    if (user.role === "manager") {
      setUser(user);
      navigation.navigate("Manager Home Screen"); // Switch this to new screen to manage "manager" accounts.
    }
    else {
      console.log("Unexpected role:", user.role);
    }
    //TODO: Setup slow-hashing passwords 

  }
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.defaultApplicationBackgroundColor} >
        <View style={styles.orderOfItems}>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder='Enter username' />
          <TextInput style={styles.input} value={password} onChangeText={setUserPassword} placeholder='Enter password' secureTextEntry={true} />
          <View style={styles.logInButton}>
            <Button title='Log In' onPress={handleLogin} />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}




function SignUpScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "#385399" }}>
      <Text style={{ paddingBottom: 8, fontSize: 20 }}>Click the button to sign up online</Text>
      <Button
        title="Sign Up"
        onPress={() => Linking.openURL("Https://www.google.dk")} />
    </View>
  )
}



function HomeScreeen({ navigation }) {

  const { currentUser } = useUsers();

  const handleJournalPress = () => { navigation.navigate("Journal Screen") };
  const handleDoctorPress = () => { navigation.navigate("Doctor Screen") };
  const handleProfilePress = () => { navigation.navigate("Profile Screen") };
  const handleAIChatPress = () => { navigation.navigate("AI Chat Screen") };

  return (
    <View style={{ flex: 1, backgroundColor: "#385399", paddingTop: "20%" }}>
      <View style={styles.topMenuItems}>
        <Text style={styles.topMenuText}>Welcome </Text>
        <Text style={styles.topMenuText}>{currentUser?.username}</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: "30%" }}>
        <TouchableOpacity style={styles.iconMenu} onPress={handleJournalPress}>
          <FontAwesomeIcon icon={faBookOpen} size={100} />
          <Text style={styles.iconTextStyle}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconMenu} onPress={handleDoctorPress}>
          <FontAwesomeIcon icon={faComment} size={100} />
          <Text style={styles.iconTextStyle}>Doctor</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={styles.iconMenu} onPress={handleProfilePress}>
          <FontAwesomeIcon icon={faUser} size={100} />
          <Text style={styles.iconTextStyle}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconMenu} onPress={handleAIChatPress}>
          <FontAwesomeIcon icon={faRobot} size={100} />
          <Text style={styles.iconTextStyle}>AI Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function JournalScreen({ navigation }) {
  
  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No events for this day</Text>
      </View>
    );
  };

  const { currentUser } = useUsers();
  const [items, setItems] = useState({});
  const formatDate = (date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    formattedDateString = formattedDate.toString();
    return formattedDateString;
  }

  useEffect(() => {
    // Fetch journal entries from backend
    const fetchJournalEntries = async () => {
      try {
        // Fetch the journal entries (replace with actual fetch or axios)
        const response = await fetch(`http://192.168.1.55:5000/userjournal/${currentUser._id}`);
        const data = await response.json();

        const entries = Array.isArray(data) ? data : [data];

        // Group entries by date
        const groupedEntries = groupEntriesByDate(entries);
        setItems(groupedEntries);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
      }
    };
    fetchJournalEntries();
  }, []);

  const groupEntriesByDate = (entries) => {
    return entries.reduce((acc, entry) => {
      const date = formatDate(entry.created_at); // Format date as 'yyyy-MM-dd'

      if (!acc[date]) {
        acc[date] = [];
      }

      // Add entry to the respective date
      acc[date].push({ name: entry.typeOfVisit, time: entry.entry_content });

      return acc;
    }, {});
  };



  return (

    <View style={styles.defaultApplicationBackgroundColor}>
      <MiniMenu navigation={navigation} />
      <Agenda showOnlySelectedDayItems={true}
        items={items}
        renderEmptyData={renderEmptyData}
        theme={{ reservationsBackgroundColor: "#385399" }}
        renderItem={(item, isFirst) => (
          <View style={{ marginVertical: 10, marginTop: 30, backgroundColor: 'white', marginHorizontal: 10, padding: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.time}</Text>
          </View>
        )} />
    </View>
  );
}

function DoctorScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const { currentUser } = useUsers();

  useEffect(() => {
    fetchUserMessages();
  
    const interval = setInterval(() => {
      fetchUserMessages(); // Poll every 5 seconds
    }, 5000);
  
    return () => clearInterval(interval);
  }, []);

  const formatForGiftedChat = (data) => {
    let formattedMessages = [];

    data.forEach((day) => {
      const { messages } = day;
      messages.forEach((message) => {
        const isDoctor = message.sender === "doctor";
        formattedMessages.push({
          _id: `${message.timestamp}-${Math.random()}`,
          text: message.content,
          createdAt: new Date(message.timestamp),
          user: {
            _id: isDoctor ? 1 : 2,
            name: isDoctor ? "Doctor" : "User",
          },
        });
      });
    });

    // Sort messages by timestamp in descending order for GiftedChat
    return formattedMessages.sort((a, b) => b.createdAt - a.createdAt);
  };

  const fetchUserMessages = async () => {
    try {
      const response = await fetch(`http://192.168.1.55:5000/usermessages/${currentUser._id}`);
      if (!response.ok) {
        console.error("Failed to fetch messages:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Raw data:", data);

      const formattedMessages = formatForGiftedChat(data.messagesByDate);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error retrieving messages:", error);
    }
  };

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    // Send message to backend
    submitMessage(newMessages[0]);
  };

  const submitMessage = async (newMessage) => {
    try {
      const messageToSend = {
        content: newMessage.text,
        timestamp: new Date(newMessage.createdAt).toISOString(),
        userId: currentUser._id,//Mulighed for fejl her--------------------------
        sender: "user",
      };

      const response = await fetch("http://192.168.1.55:5000/usermessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        console.error("Failed to send message:", response.status);
      }

      const savedMessage = await response.json();
      console.log("Message saved successfully", savedMessage);
    } catch (error) {
      console.error("Error submiting message:", error)
    }
  }

  return (
    <GiftedChat
      messages={messages || []} onSend={onSend}
      user={{
        _id: 2,
        name: `${currentUser.name}`
      }}
    />
  );
};


function ProfileScreen({ navigation }) {
  const { currentUser } = useUsers();

  function deleteUser() {
    console.log("All user data have been permenently deleted.");
    //Insert logic to delete everything about the user upon pressed.
  };

  function retrieveData() {
    console.log("Here is all the data currently stored about this particular user.")
    //Retrieve a report with all the data about the user upon pressed.
  };

  function formatDate(isoDate) {
    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const submitDataEntries = async () => {
    const addressToSubmit = address === "" ? currentUser.address : address;
    const phoneNumberToSubmit = phoneNumber === "" ? currentUser.phoneNumber : phoneNumber;
    const emailToSubmit = email === "" ? currentUser.email : email;

    const updatedData = {
      _id: currentUser._id,
      fullName: currentUser.fullName,
      dateOfBirth: currentUser.dateOfBirth,
      address: addressToSubmit,
      phoneNumber: phoneNumberToSubmit,
      email: emailToSubmit
    };



    try {
      const response = await fetch("http://192.168.1.55:5000/updateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update successful", result);
    }
    catch (error) {
      console.error("Error updating user:", error);
    }

    console.log("Updated data to submit:", updatedData);
  }

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.defaultApplicationBackgroundColor} edges={"top"}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <MiniMenu navigation={navigation} />
            <View>
              <Text>Full name:</Text>
              <TextInput style={styles.inputUnchangeable}
                value={currentUser.fullName}
                placeholder="Full name"
              />
              <Text>Date of birth:</Text>
              <TextInput
                style={styles.inputUnchangeable}
                value={currentUser.dateOfBirth ? formatDate(currentUser.dateOfBirth) : ""}
                placeholder="YYYY/MM/DD"
                editable={false}
              />
              <Text>Address:</Text>
              <TextInput style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder={currentUser.address}
                placeholderTextColor="black"
              />
              <Text>Phone number:</Text>
              <TextInput
                style={styles.input}
                inputMode="numeric"
                maxLength={8}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={currentUser.phoneNumber}
                placeholderTextColor="black"
              />
              <Text>Email address:</Text>
              <TextInput style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={currentUser.email}
                placeholderTextColor="black" />
              <Button
                title="Submit"
                style={{ paddingtop: "20" }}
                onPress={submitDataEntries}
              />
              <Button
                title="Retrieve user data"
                onPress={retrieveData}
                style={{ paddingTop: "20" }} />
              <Button
                title="Delete User"
                onPress={deleteUser}
                style={{ paddingBottom: "20" }} />

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AIChattingScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: "How can I assist you today?",
      createdAt: new Date(),
      user: {
        _id: 2, // AI's ID
        name: "A I",
      },
    },
  ]);

  const sendMessageToAI = async (userMessage) => {
    try {
      const response = await fetch("http://192.168.1.55:5000/AIConnection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.text }),
      });
      if (!response.ok) {
        console.error("Failed to fetch AI response:", response.status);
        return;
      }
      const data = await response.json();
      console.log("AI response:", data);
      const aiMessage = {
        _id: new Date().getTime(), // Generate a unique ID
        text: data.message, // The AI's response message
        createdAt: new Date(),
        user: {
          _id: 2, // AI's ID
          name: "A I",
        },
      };
      setMessages((prevMessages) => GiftedChat.append(prevMessages, [aiMessage]));
    } catch (error) {
      console.error("Error sending message to AI:", error);
    }
  };

  const onSend = (newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    const userMessage = newMessages[0]; // Get the most recent message
    sendMessageToAI(userMessage); // Send the user's message to the AI
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: "user123", // User's ID
        name: "User", // User's name
      }}
    />
  );
}


function AIChatScreen({ navigation }) {
  const handleClickToAIChatScreen = () => { navigation.navigate("AI Chatting Screen") };
  return (
    <View style={styles.defaultApplicationBackgroundColor}>
      <MiniMenu navigation={navigation} />
      <View>
        <View style={{paddingTop: 250}}>
          <Text>You are about to start using Artificial Intelligence, do keep in mind the response does not come from an actual human being, do consult your doctor before taking drastic or questionable actions.</Text>
          <Button
          title='Start Chat'
          onPress={handleClickToAIChatScreen}
          />
          </View>
      </View>
    </View>
  );
}




function ManagerHomeScreen({ navigation }) {
  const { addUser, setUser, clearUsers, setUserId } = useUsers();

  const [items, setItems] = useState([]); // To store fetched usernames
  const [selectedItem, setSelectedItem] = useState(null); // To manage the selected item


  // Fetch all users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://192.168.1.55:5000/users'); // Replace with actual backend URL
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // Parse JSON response

        // Filter out users with role "manager" and format the remaining users
        const filteredData = data
          .filter((user) => user.role !== 'manager') // Exclude users with role "manager"
          .map((user, index) => ({
            id: user._id || index + 1, // Use unique ID if available
            name: user.username || user.name || 'Unnamed', // Adjust based on your schema
            email: user.email,
            fullName: user.fullName,
            dateOfBirth: user.dateOfBirth,
            phoneNumber: user.phoneNumber,
            address: user.address,
          }));

        console.log("Filtered and Formatted Items:", filteredData); // Debugging
        setItems(filteredData);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    fetchUsers();
  }, []);

  const handleSelect = (item) => {
  clearUsers();
  setUser(item); // Set the current user in the context
  setUserId(item.id); // Store the selected user's ID in the context
  console.log("Selected user ID:", item.id); // Ensure the ID is logged properly

    navigation.navigate('Manage Patient Screen');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#385399' }}>
      <View style={{ marginHorizontal: 20, marginTop: 50 }}>
        <SearchableDropdown
          multi={false}
          selectedItems={selectedItem ? [selectedItem] : []} // Pass single item as an array
          onItemSelect={handleSelect}
          containerStyle={{ padding: 5 }}
          itemStyle={{
            padding: 10,
            marginTop: 2,
            backgroundColor: '#ddd',
            borderColor: '#bbb',
            borderWidth: 1,
            borderRadius: 5,
          }}
          itemTextStyle={{ color: '#222' }}
          itemsContainerStyle={{ maxHeight: 173 }}
          items={items}
          resetValue={false}
          textInputProps={{
            placeholder: 'Search for patient',
            underlineColorAndroid: 'transparent',
            style: {
              padding: 12,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
            },
            onTextChange: (text) => {
              if (text.length > 20) {
                console.log("Input is too long!");
              }
            },
          }}
          listProps={{
            nestedScrollEnabled: true,
          }}
        />
      </View>
    </View>
  );
}

function ManagePatientScreen({ navigation }) {
  const { currentUser } = useUsers();

  const handlePatientInfoPress = () => { navigation.navigate("Patient Info Screen") };
  const PatientJournalEntryScreen = () => { navigation.navigate("Patient Journal Entry Screen") };
  const handleSendMessageScreen = () => { navigation.navigate("Send Message Screen"); // Navigate to the message screen
  };

  return (
    <View style={{
      justifyContent: "space-evenly", flex: 1, backgroundColor: "#385399"
    }}>
      <View>
        <Text style={{ fontSize: 20 }}>Options for:</Text>
        <Text style={{ fontSize: 20 }}>{currentUser.fullName}</Text>
      </View>
      <Button
        title="Add journal entry"
        onPress={PatientJournalEntryScreen}
      />
      <Button
        title="Messages"
        onPress={handleSendMessageScreen}
      />
      <Button
        title="Patient Info"
        onPress={handlePatientInfoPress}
      />
    </View>
  );
}

function PatientInfoScreen({ navigation }) {
  const { currentUser } = useUsers();

  return (
    <View style={{ backgroundColor: "#385399", flex: 1 }}>
      <View style={{ paddingTop: 40 }}>
        <Text style={{ paddingBottom: 40 }}>Patient info screen</Text>
        <Text>Full name:</Text>
        <Text style={{ paddingBottom: 25 }}>{currentUser.fullName}</Text>
        <Text>Date of birth:</Text>
        <Text style={{ paddingBottom: 25 }}>{currentUser.dateOfBirth}</Text>
        <Text>Phonenumber:</Text>
        <Text style={{ paddingBottom: 25 }}>{currentUser.phoneNumber}</Text>
        <Text>Email:</Text>
        <Text style={{ paddingBottom: 25 }}>{currentUser.email}</Text>
      </View>
    </View>
  )
}

function PatientJournalEntryScreen({ navigation }) {
  const { currentUser } = useUsers();

  const [entryContent, setEntryContent] = useState("");
  const [typeOfVisit, setTypeOfVisit] = useState("");
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false)

  const createTwoButtonAlert = () =>
    Alert.alert('Confirmation', 'Are you sure the entered content is correct?', [
      {
        text: "No",
        onPress: () => console.log("No Pressed"),
        style: "cancel"
      },
      { 
        text: 'Yes', 
        onPress: async () => {
          try {
            const response = await fetch("http://192.168.1.55:5000/userjournal", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                idTag: currentUser.id, // Replace `currentUser.id` with the correct ID source
                entryContent,
                typeOfVisit,
                createdAt: date, // Pass the selected date
              }),
            });
  
            const data = await response.json();
  
            if (response.ok) {
              Alert.alert("Success", "Journal entry created successfully!");
              console.log("Response from server:", data);
            } else {
              Alert.alert("Error", data.message || "Failed to create journal entry.");
              console.error("Server response error:", data);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to connect to the server.");
            console.error("Error sending data:", error);
          }
        }
      }
    ]);


  return (
    <View style={{paddingTop: 20, backgroundColor: "#385399", flex: 1}}>
      <Text style={{ paddingTop: 10 }}>    Type of consultation:</Text>
      <TextInput 
      style={styles.input} 
      onChangeText={setEntryContent}/>
      <Text style={{ paddingTop: 20 }}>    Entry content:</Text>
      <TextInput 
      style={styles.input} 
      onChangeText={setTypeOfVisit}/>

      <Button title="Open DatePicker" onPress={() => setOpen(true)} />
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setOpen(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
      <View style={{paddingTop: 20, backgroundColor: "#385399", flex: 1}}>
      <Button
        title="Submit data"
        onPress={createTwoButtonAlert}
      />
      </View>
    </View>
  );
}

function DoctorMessagingScreen() {
  const { userId } = useUsers(); // Access the userId from context (the selected user)
  const [messages, setMessages] = useState([]);

  const doctor = {
    _id: "674864e5d7758fd504aed599", // Replace with actual doctor ID
    name: "Doctor Martin",
  };

  useEffect(() => {
    if (userId) {
      fetchUserMessages();
    }
  }, [userId]);

  const fetchUserMessages = async () => {
    try {
      const response = await fetch(`http://192.168.1.55:5000/usermessages/${userId}`);
      if (!response.ok) {
        console.error("Failed to fetch messages:", response.status);
        return;
      }

      const data = await response.json();

      const formattedMessages = formatForGiftedChat(data.messagesByDate);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error retrieving messages:", error);
    }
  };

  const formatForGiftedChat = (data) => {
    let formattedMessages = [];
    data.forEach((day) => {
      const { messages } = day;
      messages.forEach((message) => {
        formattedMessages.push({
          _id: `${message.timestamp}-${Math.random()}`,
          text: message.content,
          createdAt: new Date(message.timestamp),
          user: {
            _id: message.sender === "doctor" ? doctor._id : userId, // Set doctor as sender
            name: message.sender === "doctor" ? doctor.name : "User", // Set name based on sender
          },
        });
      });
    });
    return formattedMessages.sort((a, b) => b.createdAt - a.createdAt); // Sort messages by timestamp
  };

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    submitMessage(newMessages[0]);
  };

  const submitMessage = async (newMessage) => {
    console.log("Sending message to userId:", userId);
    try {
      const messageToSend = {
        content: newMessage.text,
        timestamp: new Date(newMessage.createdAt).toISOString(),
        userId: userId, // The selected user ID
        sender: "doctor", // Doctor is the sender
      };
      console.log("Sending message:", messageToSend); // Log the message payload
      const response = await fetch("http://192.168.1.55:5000/usermessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        console.error("Failed to send message:", response.status);
      }
      const savedMessage = await response.json();
      console.log("Message saved successfully", savedMessage);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: doctor._id,
        name: doctor.name,
      }}
    />
  );
}


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UsersProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome Screen" component={WelcomeScreen} />
          <Stack.Screen name="Log In Screen" component={LogInScreen} />
          <Stack.Screen name="Sign Up Screen" component={SignUpScreen} />
          <Stack.Screen name="Profile Screen" component={ProfileScreen} />
          <Stack.Screen name="Home Screen" component={HomeScreeen} />
          <Stack.Screen name="Journal Screen" component={JournalScreen} />
          <Stack.Screen name="Doctor Screen" component={DoctorScreen} />
          <Stack.Screen name="Patient Info Screen" component={PatientInfoScreen} />
          <Stack.Screen name="Patient Journal Entry Screen" component={PatientJournalEntryScreen} />
          <Stack.Screen name="Send Message Screen" component={DoctorMessagingScreen} />
          <Stack.Screen name="AI Chatting Screen" component={AIChattingScreen} />
          <Stack.Screen name="AI Chat Screen" component={AIChatScreen} />
          <Stack.Screen name="Manager Home Screen" component={ManagerHomeScreen} />
          <Stack.Screen name="Manage Patient Screen" component={ManagePatientScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UsersProvider>
  );
}

const styles = StyleSheet.create({
  defaultApplicationBackgroundColor: {
    flex: 1,
    backgroundColor: "#385399",


  },
  headerContainer: {
    paddingTop: "30%",
  },
  bodyContainer: {
    paddingTop: "50%",
  },
  header: {
    fontSize: 30,
    color: "#CCCCCC",
    fontStyle: "normal",
    fontWeight: "600",
    textAlign: "center"
  },
  body: {
    color: "#CCCCCC",
    fontSize: 15,
    paddingHorizontal: 20,
    textAlign: "center"
  },
  logInButton: {
    paddingTop: 20
  },
  signUpButton: {
    paddingTop: 20
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 10,
    color: "black",

  },
  inputUnchangeable: {
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 10,
    color: "grey",

  },
  text: {
    fontSize: 30,
    padding: 10,
  },
  orderOfItems: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "stretch",
    paddingTop: "60%"
  },
  topMenuText: {
    readOnly: true,
    fontSize: 20,
  },
  topMenuItems: {
    backgroundColor: "#2E4682",
    borderColor: "black",
    borderWidth: 2,
    height: 60,
    justifyContent: "center",
  },
  topMiniMenuItems: {
    backgroundColor: "#2E4682",
    borderColor: "black",
    borderWidth: 2,
    height: 60,
    flexDirection: "row",
  },
  iconTextStyle: {
    fontSize: 20,
    color: "white",
    alignSelf: "center"
  },
  iconMenu: {
    backgroundColor: "#2E4682",
    borderColor: "black",
    borderWidth: 1,
    width: 206,
    alignSelf: "center",
    alignItems: "center"
  },
  iconMiniMenu: {
    backgroundColor: "#2E4682",
    borderColor: "black",
    borderWidth: 1,
    width: 102,
    height: 60,
    alignSelf: "center",
    alignItems: "center",
  },
  agendaItem: {
    backgroundColor: "lightblue",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 25,
    paddingBottom: 20
  },
  agendaItemText: {
    color: "black",
    fontSize: 14
  },
  dateGroup: {
    marginBottom: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
});
