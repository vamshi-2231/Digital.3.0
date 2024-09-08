import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import AboutInputCard from "./AboutInputCard";
import ServiceInputCard from "./ServiceInputCard";
import HomeInputCard from "./HomeInputCard";
import TeamInputCard from "./TeamInputCard";
import FeatureInputCard from "./FeatureInputCard";
import AboutCard from "./AboutCard";
import ServiceCard from "./ServiceCard";
import HomeCard from "./HomeCard";
import TeamCard from "./TeamCard";
import FeatureCard from "./FeatureCard";

const CardManager = ({ isLoading, setIsLoading, onMessage }) => {
  const [cards, setCards] = useState({
    about: [],
    service: [],
    home: [],
    team: [],
    features: []
  });
  const [currentCardType, setCurrentCardType] = useState('team'); // Default card type
  const [editingCard, setEditingCard] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchAllCollections();
  }, []);

  const fetchCollectionData = async (collectionName, setter) => {
    try {
      const collectionRef = collection(db, collectionName);
      const data = await getDocs(collectionRef);
      const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setter(filteredData);
    } catch (err) {
      console.error(`Error fetching ${collectionName} data:`, err);
      onMessage(`Error fetching ${collectionName} data.`);
    }
  };

  const fetchAllCollections = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCollectionData("team", (data) => setCards(prevCards => ({ ...prevCards, team: data }))),
        fetchCollectionData("features", (data) => setCards(prevCards => ({ ...prevCards, features: data }))),
        fetchCollectionData("services", (data) => setCards(prevCards => ({ ...prevCards, service: data }))),
        fetchCollectionData("about", (data) => setCards(prevCards => ({ ...prevCards, about: data }))),
        fetchCollectionData("home", (data) => setCards(prevCards => ({ ...prevCards, home: data })))
      ]);
    } catch (err) {
      onMessage("Error fetching collections.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (type, newCard, file) => {
    setIsLoading(true);
    try {
      let imageUrl = null;
      if (file) {
        const imageRef = ref(storage, `${type}Images/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(db, type), { ...newCard, imageUrl });
      onMessage(`${type} created successfully.`);
      fetchCollectionData(type, (data) => {
        setCards(prevCards => ({ ...prevCards, [type]: data }));
        window.location.reload(); // Refresh page after creating a card
      });
    } catch (err) {
      onMessage(`Error creating ${type}.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (type, id, updatedData, newImage) => {
    setIsLoading(true);
    try {
      let imageUrl = null;
      if (newImage) {
        const imageRef = ref(storage, `${type}Images/${id}_${Date.now()}_${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      const docRef = doc(db, type, id);
      await updateDoc(docRef, { ...updatedData, ...(imageUrl && { imageUrl }) });
      onMessage(`${type} updated successfully.`);
      fetchCollectionData(type, (data) => {
        setCards(prevCards => ({ ...prevCards, [type]: data }));
        window.location.reload(); // Refresh page after updating a card
      });
    } catch (err) {
      onMessage(`Error updating ${type}.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, type, id));
      onMessage(`${type} deleted successfully.`);
      fetchCollectionData(type, (data) => {
        setCards(prevCards => ({ ...prevCards, [type]: data }));
        window.location.reload(); // Refresh page after deleting a card
      });
    } catch (err) {
      onMessage(`Error deleting ${type}.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (card) => {
    setEditingCard(card);
    setUpdatedData(card);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleUpdateSubmit = async () => {
    if (editingCard) {
      await handleEdit(currentCardType, editingCard.id, updatedData, newImage);
      setEditingCard(null);
      setUpdatedData({});
      setNewImage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setUpdatedData({});
    setNewImage(null);
  };

  return (
    <div className="card-manager">
      <div className="card-manager-controls">
        <button onClick={() => setCurrentCardType('team')}>Manage Team</button>
        <button onClick={() => setCurrentCardType('features')}>Manage Features</button>
        <button onClick={() => setCurrentCardType('service')}>Manage Services</button>
        <button onClick={() => setCurrentCardType('about')}>Manage About</button>
        <button onClick={() => setCurrentCardType('home')}>Manage Home Photos</button>
      </div>

      <div className="card-manager-content">
        {currentCardType === 'team' && (
          <>
            <TeamInputCard onCreate={(newCard, file) => handleCreate('team', newCard, file)} isLoading={isLoading} />
            <div className="card-list">
              {cards.team.map(card => (
                <TeamCard
                  key={card.id}
                  item={card}
                  onEdit={() => startEditing(card)}
                  onDelete={() => handleDelete('team', card.id)}
                />
              ))}
            </div>
          </>
        )}

        {currentCardType === 'features' && (
          <>
            <FeatureInputCard onCreate={(newCard, file) => handleCreate('features', newCard, file)} isLoading={isLoading} />
            <div className="card-list">
              {cards.features.map(card => (
                <FeatureCard
                  key={card.id}
                  item={card}
                  onEdit={() => startEditing(card)}
                  onDelete={() => handleDelete('features', card.id)}
                />
              ))}
            </div>
          </>
        )}

        {currentCardType === 'service' && (
          <>
            <ServiceInputCard onCreate={(newCard, file) => handleCreate('services', newCard, file)} isLoading={isLoading} />
            <div className="card-list">
              {cards.service.map(card => (
                <ServiceCard
                  key={card.id}
                  item={card}
                  onEdit={() => startEditing(card)}
                  onDelete={() => handleDelete('services', card.id)}
                />
              ))}
            </div>
          </>
        )}

        {currentCardType === 'about' && (
          <>
            <AboutInputCard onCreate={(newCard, file) => handleCreate('about', newCard, file)} isLoading={isLoading} />
            <div className="card-list">
              {cards.about.map(card => (
                <AboutCard
                  key={card.id}
                  item={card}
                  onEdit={() => startEditing(card)}
                  onDelete={() => handleDelete('about', card.id)}
                />
              ))}
            </div>
          </>
        )}

        {currentCardType === 'home' && (
          <>
            <HomeInputCard onCreate={(newCard, file) => handleCreate('home', newCard, file)} isLoading={isLoading} />
            <div className="card-list">
              {cards.home.map(card => (
                <HomeCard
                  key={card.id}
                  item={card}
                  onEdit={() => startEditing(card)}
                  onDelete={() => handleDelete('home', card.id)}
                />
              ))}
            </div>
          </>
        )}

        {editingCard && (
          <div className="edit-form">
            <h3>Edit {currentCardType.slice(0, -1)}</h3>
            {Object.keys(updatedData).map(key => (
              key !== 'id' && key !== 'imageUrl' && (
                <div key={key} className="edit-form-field">
                  <label>{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={updatedData[key] || ''}
                    onChange={handleUpdateChange}
                  />
                </div>
              )
            ))}
            <div className="edit-form-field">
              <label>Image</label>
              <input type="file" onChange={handleImageChange} />
            </div>
            <button onClick={handleUpdateSubmit}>Update</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardManager;
