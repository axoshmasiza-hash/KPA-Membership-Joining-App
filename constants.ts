import type { Province } from './types';

export const PROVINCES: Province[] = [
  { 
    name: 'Eastern Cape', 
    municipalities: [
      'Amahlathi', 'Blue Crane Route', 'Buffalo City Metropolitan Municipality', 'Dr Beyers Naudé', 'Elundini', 
      'Emalahleni', 'Engcobo', 'Enoch Mgijima', 'Great Kei', 'Ingquza Hill', 
      'Intsika Yethu', 'Inxuba Yethemba', 'King Sabata Dalindyebo', 'Kou-Kamma', 'Kouga', 
      'Makana', 'Matatiele', 'Mbhashe', 'Mhlontlo', 'Mnquma', 'Ndlambe',
      'Nelson Mandela Bay Metropolitan Municipality', 'Ngqushwa', 'Ntabankulu', 'Nyandeni', 'Port St Johns', 
      'Raymond Mhlaba', 'Sakhisizwe', 'Senqu', 'Sundays River Valley', 'Umzimvubu', 'Walter Sisulu', 'Winnie Madikizela-Mandela'
    ].sort() 
  },
  { 
    name: 'Free State', 
    municipalities: [
      'Dihlabeng', 'Kopanong', 'Letsemeng', 'Mafube', 'Maluti-a-Phofung', 'Mangaung Metropolitan Municipality', 
      'Mantsopa', 'Masilonyana', 'Matjhabeng', 'Metsimaholo', 'Mohokare', 'Moqhaka', 
      'Nala', 'Nketoana', 'Ngwathe', 'Phumelela', 'Setsoto', 'Tokologo', 'Tswelopele'
    ].sort() 
  },
  { 
    name: 'Gauteng', 
    municipalities: [
      'City of Ekurhuleni Metropolitan Municipality', 'City of Johannesburg Metropolitan Municipality', 'City of Tshwane Metropolitan Municipality', 'Emfuleni', 
      'Lesedi', 'Merafong City', 'Midvaal', 'Mogale City', 'Rand West City'
    ].sort() 
  },
  { 
    name: 'KwaZulu-Natal', 
    municipalities: [
      'AbaQulusi', 'Alfred Duma', 'Big Five Hlabisa', 'Dannhauser', 'Dr Nkosazana Dlamini-Zuma', 'eDumbe', 
      'eMadlangeni', 'Endumeni', 'eThekwini Metropolitan Municipality', 'Greater Kokstad', 'Impendle', 'Inkosi Langalibalele', 
      'Jozini', 'KwaDukuza', 'Mandeni', 'Maphumulo', 'Mkhambathini', 'Mpofana', 'Msinga', 
      'Msunduzi', 'Mthonjaneni', 'Mtubatuba', 'Ndwedwe', 'Newcastle', 'Nkandla', 
      'Nongoma', 'Nquthu', 'Okhahlamba', 'Ray Nkonyeni', 'Richmond', 'Ubuhlebezwe', 'Ulundi',
      'uMdoni', 'uMfolozi', 'uMhlabuyalingana', 'uMhlathuze', 'uMlalazi', 'uMngeni', 'uMshwathi', 
      'uMuziwabantu', 'Umvoti', 'Umzimkhulu', 'Umzumbe', 'uPhongolo'
    ].sort() 
  },
  { 
    name: 'Limpopo', 
    municipalities: [
      'Ba-Phalaborwa', 'Bela-Bela', 'Blouberg', 'Collins Chabane', 'Elias Motsoaledi', 
      'Ephraim Mogale', 'Fetakgomo Tubatse', 'Greater Giyani', 'Greater Letaba', 'Greater Tzaneen', 
      'Lepelle-Nkumpi', 'Lephalale', 'Makhado', 'Makhuduthamaga', 'Maruleng', 
      'Modimolle-Mookgophong', 'Mogalakwena', 'Molemole', 'Musina', 'Polokwane', 'Thabazimbi', 'Thulamela'
    ].sort() 
  },
  { 
    name: 'Mpumalanga', 
    municipalities: [
      'Bushbuckridge', 'Chief Albert Luthuli', 'City of Mbombela', 'Dipaleseng', 
      'Dr JS Moroka', 'Dr Pixley Ka Isaka Seme', 'Emakhazeni', 'Emalahleni', 'Govan Mbeki', 
      'Lekwa', 'Mkhondo', 'Msukaligwa', 'Nkomazi', 'Steve Tshwete', 'Thaba Chweu', 
      'Thembisile Hani', 'Victor Khanye'
    ].sort() 
  },
  { 
    name: 'North West', 
    municipalities: [
      'City of Matlosana', 'Ditsobotla', 'Greater Taung', 'JB Marks', 'Kagisano-Molopo', 
      'Kgetlengrivier', 'Lekwa-Teemane', 'Madibeng', 'Mahikeng', 'Mamusa', 'Maquassi Hills', 
      'Moretele', 'Moses Kotane', 'Naledi', 'Ramotshere Moiloa', 'Ratlou', 'Rustenburg', 'Tswaing'
    ].sort() 
  },
  { 
    name: 'Northern Cape', 
    municipalities: [
      'Dawid Kruiper', 'Dikgatlong', 'Emthanjeni', 'Ga-Segonyana', 'Gamagara', 'Hantam', 
      'Joe Morolong', 'Kai !Garib', 'Kamiesberg', 'Kareeberg', 'Karoo Hoogland', 'Kgatelopele', 
      '!Kheis', 'Magareng', 'Nama Khoi', 'Phokwane', 'Renosterberg', 'Richtersveld', 
      'Siyancuma', 'Siyathemba', 'Sol Plaatje', 'Thembelihle', 'Tsantsabane', 'Ubuntu', 'Umsobomvu'
    ].sort() 
  },
  { 
    name: 'Western Cape', 
    municipalities: [
      'Beaufort West', 'Bergrivier', 'Bitou', 'Breede Valley', 'Cape Agulhas', 'Cederberg', 
      'City of Cape Town Metropolitan Municipality', 'Drakenstein', 'George', 'Hessequa', 'Kannaland', 'Knysna', 
      'Laingsburg', 'Langeberg', 'Matzikama', 'Mossel Bay', 'Oudtshoorn', 'Overstrand', 
      'Prince Albert', 'Saldanha Bay', 'Stellenbosch', 'Swartland', 'Swellendam', 
      'Theewaterskloof', 'Witzenberg'
    ].sort() 
  },
];

export const WHATSAPP_SHARE_URL = 'https://wa.me/?text=Join%20the%20KPA!%20Apply%20here:%20' + encodeURIComponent(window.location.href);

export const DEFAULT_KPA_LOGO_BASE64 = 'data:image/jpeg;base64,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';

export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin@1';