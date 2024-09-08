# Requirements Document - future EZElectronics

Date:

Version: V2 - description of EZElectronics in FUTURE form (as proposed by the team)

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - future EZElectronics](#requirements-document---future-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Table of rights](#table-of-rights)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Login, UC1](#login-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.3](#scenario-13)
    - [Logout, UC2](#logout-uc2)
      - [Scenario 2.1](#scenario-21)
    - [Creazione nuovo utente, UC3](#creazione-nuovo-utente-uc3)
      - [Scenario 3.1](#scenario-31)
      - [Scenario 3.2](#scenario-32)
      - [Scenario 3.3](#scenario-33)
    - [Recupero lista utenti registrati, UC4](#recupero-lista-utenti-registrati-uc4)
      - [Scenario 4.1](#scenario-41)
      - [Scenario 4.2](#scenario-42)
      - [Scenario 4.3](#scenario-43)
      - [Scenario 4.4](#scenario-44)
    - [Cancellazione utenti, UC5](#cancellazione-utenti-uc5)
      - [Scenario 5.1](#scenario-51)
      - [Scenario 5.2](#scenario-52)
    - [Creazione prodotto, UC6](#creazione-prodotto-uc6)
      - [Scenario 6.1](#scenario-61)
      - [Scenario 6.2](#scenario-62)
      - [Scenario 6.3](#scenario-63)
    - [Registrazione set di prodotti in arrivo, UC7](#registrazione-set-di-prodotti-in-arrivo-uc7)
      - [Scenario 7.1](#scenario-71)
      - [Scenario 7.2](#scenario-72)
    - [Marcare un prodotto come venduto, UC8](#marcare-un-prodotto-come-venduto-uc8)
      - [Scenario 8.1](#scenario-81)
      - [Scenario 8.2](#scenario-82)
      - [Scenario 8.3](#scenario-83)
      - [Scenario 8.4](#scenario-84)
      - [Scenario 8.5](#scenario-85)
      - [Scenario 8.6](#scenario-86)
    - [Recupero prodotti dal database, UC9](#recupero-prodotti-dal-database-uc9)
      - [Scenario 9.1](#scenario-91)
      - [Scenario 9.2](#scenario-92)
      - [Scenario 9.3](#scenario-93)
      - [Scenario 9.4](#scenario-94)
      - [Scenario 9.5](#scenario-95)
      - [Scenario 9.6](#scenario-96)
    - [Cancellazione di un prodotto dal database, UC10](#cancellazione-di-un-prodotto-dal-database-uc10)
      - [Scenario 10.1](#scenario-101)
      - [Scenario 10.2](#scenario-102)
    - [Recupero carrello corrente, UC11](#recupero-carrello-corrente-uc11)
      - [Scenario 11.1](#scenario-111)
    - [Aggiunta prodotto al carrello, UC12](#aggiunta-prodotto-al-carrello-uc12)
      - [Scenario 12.1](#scenario-121)
      - [Scenario 12.2](#scenario-122)
      - [Scenario 12.3](#scenario-123)
    - [Pagamento del carrello corrente, UC13](#pagamento-del-carrello-corrente-uc13)
      - [Scenario 13.1](#scenario-131)
      - [Scenario 13.2](#scenario-132)
      - [Scenario 13.3](#scenario-133)
      - [Scenario 13.4](#scenario-134)
      - [Scenario 13.5](#scenario-135)
    - [Cronologia dei carrelli passati, UC14](#cronologia-carrelli-passati-uc14)
      - [Scenario 14.1](#scenario-141)
    - [Rimozione prodotto da carrello, UC15](#rimozione-prodotto-da-carrello-uc15)
      - [Scenario 15.1](#scenario-151)
    - [Cancellazione del carrello, UC16](#cancellazione-del-carrello-uc16)
      - [Scenario 16.1](#scenario-161)
    - [Visualizzazione informazioni personali, UC17](#visualizzazione-informazioni-personali-uc17)
      - [Scenario 17.1](#scenario-171)
    - [Inserimento indirizzo di spedizione, UC18](#inserimento-indirizzo-di-spedizione-uc18)
      - [Scenario 18.1](#scenario-181)
      - [Scenario 18.2](#scenario-182)
    - [Visualizzazione stato dell'ordine, UC19](#visualizzazione-stato-dellordine-uc19)
      - [Scenario 19.1](#scenario-191)


- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Cliente          | È interessato ad acquistare prodotti elettronici |
| Manager          | È interessato a gestire negozi di prodotti elettronici |
| Shop concorrente | È interessato a emulare alcune caratteristiche del prodotto |
| Software factory, admin | Sono interessati al corretto funzionamento del prodotto |
| Servizio di spedizione| È interessato ad offrire un servizio per il trasporto dei prodotti acquistati da un cliente|
| Servizio di pagamento | È interessato a fornire servizi necessari per effettuare pagamenti online |

# Context Diagram and interfaces

## Context Diagram

![Uml_use_cases](/assets/context_diagram_v2.png)

## Interfaces

|   Actor                  | Physical Interface | Logical Interface                         |
| :-------:                | :---------------: | :----------------:                         |
| Cliente            | PC     | GUI : visualizzazione prodotti, carrello, pagamento carrello |
| Manager         | PC                | GUI : aggiunta prodotti|
| Admin | PC | GUI: visuliazzione Clienti e Manager, Rimozione Clienti e Manager 
| Servizio di spedizione | APIs    | [Poste Italiane API](https://apigardent.gp.posteitaliane.it/col/internet/forum/2) |
| Servizio pagamento       | APIs          | [Paypal Rest API](https://developer.paypal.com/api/rest/)                              |

# Stories and personas

- Persona 1: uomo, professionista in carriera con alto reddito, sposato, con figli, 40 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare facilmente e velocemente prodotti elettronici per la famiglia

- Persona 2: ragazzo, studente, 20 anni, figlio di impiegati
  - Story: utilizza l’applicazione EzElectronics per confrontare il prezzo di vendita di prodotti elettronici rispetto ad altri e-commerce o negozi fisici per acquistare al minor prezzo possibile 

- Persona 3: donna, vive in paese isolato, casalinga, senza patente, sposata, con figli, 45 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare comodamente elettrodomestici di cui la famiglia ha bisogno, senza la necessità di usare un mezzo di trasporto, grazie al servizio di spedizione

- Persona 4: uomo, manager di un'azienda, sposato, 50 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare un certo numero di pc, tutti dello stesso modello, da includere nella sua azienda per i suoi dipendenti

- Persona 5: giovane uomo, rappresentante di commercio, 30 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare prodotti elettronici, da rivendere ai suoi clienti

- Persona 6: ragazza, studentessa di informatica, 24 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare prodotti elettronici, da usare per l'università. Paga online per via della sicurezza offerta da PayPal

- Persona 7: uomo, infermiere, 40 anni
  - Story: utilizza l’applicazione EzElectronics per acquistare prodotti elettronici per uso personale. A causa degli orari di lavoro è impossibilitato ad andare in negozio fisico quando questo è aperto, paga online e usa il servizio di spedizione

# Functional and non functional requirements

## Functional Requirements

|  ID   | Description |
| :---: | :---------: |
| **FR1**  | **Autenticazione e Autorizzazione** |
| FR1.1 | Login |
| FR1.2 | Logout |
| FR1.3 | Recupero informazioni account |
| FR1.4 | Registrazione |
| **FR2**  | **Gestione Utenti** |
| FR2.1 | Recupero lista utenti registrati |
| FR2.2 | Recupero informazioni utenti (per ruolo o per username) |
| FR2.3 | Cancellazione utente |
| **FR3**  | **Gestione Prodotti** |
| FR3.1 | Creazione nuovo prodotto |
| FR3.2 | Registrazione arrivo di prodotti multipli |
| FR3.3 | Segnalare prodotto come venduto |
| FR3.4 | Recupero lista prodotti registrati  |
| FR3.5 | Recupero informazioni prodotto (dato codice prodotto, o categoria o per modello) |
| FR3.6 | Rimozione singolo prodotto (dato codice prodotto) |
| **FR4**  | **Gestione Carrello** |
| FR4.1 | Visualizzazione carrello |
| FR4.2 | Aggiunta di un prodotto al carrello |
| FR4.3 | Pagamento del carrello |
| FR4.4 | Visualizzazione cronologia carrelli |
| FR4.5 | Rimozione prodotto dal carrello (dato codice prodotto) |
| FR4.6 | Cancellazione intero carrello |
| FR4.7 | Generazione coupon sconto |
| FR4.8 | Acquisto tramite coupon sconto |
| **FR5**  | **Gestione Spedizione** |
| FR5.1 | Inserimento indirizzo di consegna |
| FR5.2 | Visualizzazione stato dell'ordine |
| **FR6**  | **Gestione Pagamento** |
| FR6.1 | Scelta tipo pagamento |
| FR6.2 | Gestione dati pagamento |
| FR6.3 | Visualizzazione esito pagamento |

## Non Functional Requirements

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   | Usability                          | L’utente non deve avere bisogno di training                 | FR1, FR3.4, FR3.5, FR4, FR5, FR6       |
|  NFR2   | Usability                          | Il manager ha bisogno di un training di al massimo 1 ora | FR1, FR3       |
|  NFR3   | Efficiency                         | Tutte le funzionalità devono completarsi in un tempo minore di 0.1 sec (escludendo la rete) | Tutti i FRs |
|  NFR4   | Efficiency                         | L'applicazione non deve richiedere più di 80 MB di spazio su disco  | Tutti i FRs          |
|  NFR5   | Efficiency                         | L'applicazione non deve richiedere più di 40 MB di RAM              |    Tutti i FRs       |
|  NFR6   | Availability                        | Il servizio deve andare in down non più di 2 volte l’anno  |    Tutti i FRs       |
|  NFR7   | Portability                        | L'applicazione deve essere accessibile dai seguenti browser: <ul><li>Chrome (e basati su Chrome, da versione 108)</li><li>Firefox (da versione 106)</li><li>Safari (da versione 15)</li><li>Opera (da versione 15)</li></ul> | Tutti i FRs
|  NFR8   | Delivery                           |   Il tempo stimato di consegna deve essere rispettato, entro un massimo di 2 giorni           |   FR5        |
|  NFR9  | Performance                        |     Il sistema deve riuscire a garantire l'evasione di un numero minimo di 500 ordini al giorno |     FR4, FR5, FR6      |
|  NFR10   | Privacy                           |  Il sistema non deve tollerare alcuna fuga di informazioni sensibili dei clienti, inclusi i dati di pagamento e gli indirizzi di spedizione          |     FR5, FR6      |
|  NFR11 | Security                          | Il servizio di pagamento deve essere conforme allo standard PCI DSS | FR6 |
|  NFR12  | Security                          | Il servizio di pagamento deve implementare un protocollo crittografico TLS di versione 1.2 o superiore | FR6 |
|  NFR13  | Usability                          | La procedura di pagamento deve essere completata in massimo 1 minuto | FR6 |
|  NFR14  | Usability                          | L'admin ha bisogno di un training di al massimo 1 ora | FR2, FR3.4, FR3.5 |

## Table of rights

| Attore                 | FRs 1.1 e 1.4 | FRs 1.2 e 1.3 | FR2   | FR3 (no 3.4 e 3.5) | FRs 3.4 e 3.5 | FR4   | FR5   | FR6   |
| :---:                  | :---:         | :---:         | :---: | :---:              | :---:         | :---: | :---: | :---: |
| Cliente                |               | X             |       |                    | X             | X     | X     | X     |
| Manager                |               | X             |       | X                  | X             |       |       |       |
| Admin                  |               | X             | X     |                    | X             |       |       |       |
| Utente non autenticato | X             |               |       |                    | X             |       |       |       |


# Use case diagram and use cases

## Use case diagram

![Use_case_diagram](/assets/use_case_diagram_v2.png)

### Login, UC1

| - |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente non è autenticato                                        |
|  Post condition  | L'utente è autenticato                                            |
| Nominal Scenario | 1.1 |
|     Variants     |  -                      |
|    Exceptions    | 1.2, 1.3 |

#### Scenario 1.1

|  Scenario 1.1  |  Login avvenuto correttamente                        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | L'utente è autenticato |
|   **Step#**    |                              **Description**                               |
|       1        | Il sistema richiede username e password                                    |
|       2        | L'utente inserisce username e password                                     |
|       3        | Il sistema autentica l'utente e presenta schermata personale |

#### Scenario 1.2

|  Scenario 1.2  |  Nome utente non registrato                                                |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | L'utente non è autenticato |
|   **Step#**    |                              **Description**                               |
|       1        | Il sistema richiede username e password                                    |
|       2        | L'utente inserisce username e password                                     |
|       3        | Il sistema segnala che il nome utente non è registrato       |

#### Scenario 1.3

|  Scenario 1.3  |  Password errata                                                           |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | L'utente non è autenticato |
|   **Step#**    |                              **Description**                               |
|       1        | Il sistema richiede username e password                                    |
|       2        | L'utente inserisce username e password                                     |
|       3        | Il sistema segnala che la password per l'utente è errata                   |

### Logout, UC2

| Cliente, Manager, Admin |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato                                            |
|  Post condition  | L'utente non è più autenticato                                    |
| Nominal Scenario | 2.1                            |
|     Variants     |                      -                      |
|    Exceptions    | -                                                |


#### Scenario 2.1

|  Scenario 2.1  |  Logout avvenuto correttamente                        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato |
| Post condition | L'utente non è più autenticato |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia la procedura di logout                             |
|       2        | Il sistema effettua logout dell'utente e presenta schermata di login |



### Creazione nuovo utente, UC3

| - |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente non è autenticato                      |
|  Post condition  | Il sistema ha registrato un nuovo account       |
| Nominal Scenario | 3.1                           |
|     Variants     | 3.3                           |
|    Exceptions    | 3.2                           |

#### Scenario 3.1

|  Scenario 3.1  |  Creazione nuovo utente                                                   |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | Il sistema ha registrato un nuovo account                                  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la schermata di iscrizione                               |
|       2        | Il sistema presenta la schermata all'utente                                |
|       3        | L'utente compila i campi richiesti e conferma l'operazione                 |
|       4        | Il sistema crea un nuovo account per l'utente                              |

#### Scenario 3.2

|  Scenario 3.2  |  Username già utilizzato                                                   |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | Stato del sistema invariato                                                |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la schermata di iscrizione                               |
|       2        | Il sistema presenta la schermata all'utente                                |
|       3        | L'utente compila i campi richiesti e conferma l'operazione                 |
|       4        | Il sistema segnala che il nome utente è già in uso                         |

#### Scenario 3.3

|  Scenario 3.3  |  Registrazione admin                                                   |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è autenticato |
| Post condition | Il sistema ha registrato un nuovo account admin                            |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la schermata di registrazione admin                      |
|       2        | Il sistema presenta la schermata all'utente                                |
|       3        | L'utente compila i campi richiesti e conferma l'operazione                 |
|       4        | Il sistema crea un nuovo account admin                                     |


### Recupero lista utenti registrati, UC4
| Admin |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | -                                   |
|  Post condition  | Ottenimento lista di utenti registrati                            |
| Nominal Scenario | 4.1                      |
|     Variants     | 4.2, 4.3            |
|    Exceptions    | 4.4                     |

#### Scenario 4.1

|  Scenario 4.1  |  Recupero di tutti gli utenti                                              |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Ottenimento lista di utenti registrati                                     |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la lista di tutti gli utenti registrati                             |
|       2        | Il sistema restituisce la lista degli utenti registrati                    |

#### Scenario 4.2

|  Scenario 4.2  |  Recupero degli utenti per ruolo                                           |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Ottenimento lista degli utenti con uno specifico ruolo                     |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un ruolo e richiede la lista degli utenti con quel ruolo|
|       2        | Il sistema restituisce la lista degli utenti appartenenti al ruolo richiesto|

#### Scenario 4.3

|  Scenario 4.4  |  Recupero di utente specifico                                              |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Ottenimento di info di uno specifico utente                                |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente inserisce l'username di un utente e richiede le sue informazioni  |
|       2        | Il sistema restituisce la schermata con le informazioni dell'utente |

#### Scenario 4.4

|  Scenario 4.5  |  Recupero di utente non esistente                                          |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente inserisce l'username di un utente e richiede le sue informazioni  |
|       2        | Il sistema restituisce un messaggio di errore |

### Cancellazione utenti UC5
| Admin |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come admin                      |
|  Post condition  | Gli utenti selezionati sono eliminati dal servizio                |
| Nominal Scenario | 5.1 | 
|     Variants     | -            |
|    Exceptions    | 5.2                     |

#### Scenario 5.1

|  Scenario 5.1  |  Cancellazione di specifico utente                                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Uno specifico utente è cancellato dal database                              |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di cancellazione, specificando un username         |
|       2        | Il sistema chiede conferma della procedura                                 |
|       3        | L'utente conferma la procedura                                              |
|       4        | Il sistema cancella l'utente con l'username indicato                       |

#### Scenario 5.2

|  Scenario 5.2  |  Cancellazione di utente non esistente                        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come admin |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di cancellazione, specificando un username         |
|       2        | Il sistema restituisce un messaggio di errore                              |


### Creazione prodotto, UC6
| Manager |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come manager                          |
|  Post condition  | Viene creato un nuovo prodotto nel database                          |
| Nominal Scenario | 6.1 | 
|     Variants     | -           |
|    Exceptions    | 6.2, 6.3                     |

#### Scenario 6.1

|  Scenario 6.1  |  Creazione prodotto                                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Viene creato un nuovo prodotto nel database                                |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di creazione nuovo prodotto         |
|       2        | Il sistema richiede le info necessarie alla creazione del prodotto         |
|       3        | L'utente inserisce le informazioni e conferma l'inserimento         |
|       4        | Il sistema fornisce un feedback sul successo dell'operazione         |

#### Scenario 6.2

|  Scenario 6.2  |  Creazione prodotto già esistente                                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di creazione nuovo prodotto         |
|       2        | Il sistema richiede le info necessarie alla creazione del prodotto         |
|       3        | L'utente inserisce le informazioni e conferma l'inserimento         |
|       4        | Il sistema restituisce un messaggio di errore         |

#### Scenario 6.3

|  Scenario 6.3  |  Creazione prodotto con data di arrivo prima di quella attuale |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di creazione nuovo prodotto         |
|       2        | Il sistema richiede le info necessarie alla creazione del prodotto         |
|       3        | L'utente inserisce le informazioni e conferma l'inserimento         |
|       4        | Il sistema restituisce un messaggio di errore         |



### Registrazione set di prodotti in arrivo, UC7

| Manager  |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come manager                          |
|  Post condition  | Viene registrato un set di prodotti come in arrivo                          |
| Nominal Scenario | 7.1 | 
|     Variants     | -           |
|    Exceptions    | 7.2  |

#### Scenario 7.1

|  Scenario 7.1  |  Registrazione set di prodotti in arrivo |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Viene registrato un set di prodotti come in arrivo                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di registrazione arrivo prodotti         |
|       2        | Il sistema richiede le info necessarie alla registrazione dei prodotti in arrivo         |
|       3        | L'utente inserisce le informazioni e conferma l'inserimento         |

#### Scenario 7.2

|  Scenario 7.2  |  Registrazione set di prodotti con data di arrivo successiva a quella corrente|
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente avvia procedura di registrazione arrivo prodotti         |
|       2        | Il sistema richiede le info necessarie alla registrazione dei prodotti in arrivo         |
|       3        | L'utente inserisce le informazioni e conferma l'inserimento         |
|       4        | Il sistema restituisce un messaggio di errore         |

### Marcare un prodotto come venduto, UC8

| Manager  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come manager                          |
|  Post condition  | Il prodotto selezionato è marcato come "venduto"                     |
| Nominal Scenario | 8.1 | 
|     Variants     | 8.2                            |
|    Exceptions    | 8.3, 8.4, 8.5, 8.6|

#### Scenario 8.1

|  Scenario 8.1  |  Marcare un prodotto come venduto |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Il prodotto selezionato è marcato come "venduto"                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto per eseguirne la vendita     |
|       2        | Il sistema lo marca come "venduto"         |

#### Scenario 8.2

|  Scenario 8.2  |  Marcare un prodotto come venduto assegnando data di vendita |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Il prodotto selezionato è marcato come "venduto"                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto e assegna una data di vendita, per eseguirne la vendita     |
|       2        | Il sistema lo marca come "venduto"         |

#### Scenario 8.3

|  Scenario 8.3  |  Marcare un prodotto non nel database come venduto                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto per eseguirne la vendita     |
|       2        | Il sistema restituisce un messaggio di errore         |

#### Scenario 8.4

|  Scenario 8.4  |  Marcare un prodotto già venduto come venduto                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto per eseguirne la vendita     |
|       2        | Il sistema restituisce un messaggio di errore         |

#### Scenario 8.5

|  Scenario 8.5  |  Marcare un prodotto come venduto in data successiva alla corrente         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto e assegna una data di vendita, per eseguirne la vendita     |
|       2        | Il sistema restituisce un messaggio di errore         |

#### Scenario 8.6

|  Scenario 8.6  |  Marcare un prodotto come venduto in data precedente rispetto a quella del suo arrivo         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona un prodotto e assegna una data di vendita, per eseguirne la vendita     |
|       2        | Il sistema restituisce un messaggio di errore         |

### Recupero prodotti dal database, UC9

| -   |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | -                                               |
|  Post condition  | L'utente visualizza i prodotti richiesti                             |
| Nominal Scenario | 9.1 | 
|     Variants     | 9.2, 9.3, 9.4, 9.5, 9.6                             |
|    Exceptions    | - |

#### Scenario 9.1

|  Scenario 9.1  | Visualizzazione di tutti i prodotti        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione di tutti i prodotti del database                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |

#### Scenario 9.2

|  Scenario 9.2  | Visualizzazione di uno specifico prodotto        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione di uno specifico prodotto                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |
|       3        | L'utente seleziona un prodotto da visualizzare         |
|       4        | Il sistema mostra la schermata relativa al prodotto selezionato         |

#### Scenario 9.3

|  Scenario 9.3  | Visualizzazione dei prodotti già venduti        |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione dei prodotti già venduti                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |
|       3        | L'utente applica il filtro per visualizzare i prodotti già venduti         |
|       4        | Il sistema restituisce la lista dei prodotti già venduti         |

#### Scenario 9.4

|  Scenario 9.4  | Visualizzazione dei prodotti non ancora venduti       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione dei prodotti non ancora venduti                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |
|       3        | L'utente applica il filtro per visualizzare i prodotti non ancora venduti    |
|       4        | Il sistema restituisce la lista dei prodotti non ancora venduti         |

#### Scenario 9.5

|  Scenario 9.5  | Visualizzazione dei prodotti di una categoria       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione dei prodotti di una categoria                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |
|       3        | L'utente applica il filtro per visualizzare i prodotti di una categoria    |
|       4        | Il sistema restituisce la lista dei prodotti di una categoria         |

#### Scenario 9.6

|  Scenario 9.6  | Visualizzazione dei prodotti di un modello       |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | - |
| Post condition | Visualizzazione dei prodotti di un modello                          |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione dei prodotti     |
|       2        | Il sistema restituisce la lista di tutti i prodotti nel database         |
|       3        | L'utente applica il filtro per visualizzare i prodotti di un modello    |
|       4        | Il sistema restituisce la lista dei prodotti di un modello         |


### Cancellazione di un prodotto dal database, UC10

| Gestore |                                                 |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come manager                                 |
|  Post condition  | I prodotti selezionati sono eliminati dal servizio                |
| Nominal Scenario | 10.1 | 
|     Variants     | -       |
|    Exceptions    | 10.2                     |

#### Scenario 10.1

|  Scenario 10.1  |  Cancellazione di un prodotto             |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Il prodotto con lo specifico codice è cancellato dal database              |
|   **Step#**    |                              **Description**                               |
|       1        | Il manager inserisce il codice prodotto e avvia procedura di cancellazione del prodotto |
|       2        | Il sistema chiede conferma della procedura                                 |
|       3        | Il manager conferma la procedura                                              |
|       4        | Il sistema cancella il prodotto che ha il codice specificato               |

#### Scenario 10.2

|  Scenario 10.2  |  Cancellazione di un prodotto non esistente                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come manager |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | Il manager inserisce il codice prodotto e avvia procedura di cancellazione del prodotto |
|       2        | Il sistema restituisce un messaggio di errore |

### Recupero carrello corrente, UC11

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | L'utente visualizza i prodotti attualmente nel suo carrello          |
| Nominal Scenario | 11.1 | 
|     Variants     | -                                                                    |
|    Exceptions    | -                                                                    |

#### Scenario 11.1

|  Scenario 11.1 |  Recupero carrello corrente                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | L'utente visualizza i prodotti attualmente nel suo carrello                |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visione del proprio carrello |
|       2        | Il sistema restituisce la lista di prodotti nel suo carrello |

### Aggiunta prodotto al carrello, UC12

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | Il prodotto selezionato viene aggiunto al carrello          |
| Nominal Scenario | 12.1 | 
|     Variants     | -                                                                    |
|    Exceptions    | 12.2, 12.3                                     |

#### Scenario 12.1

|  Scenario 12.1 |  Aggiunta prodotto al carrello                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Il prodotto selezionato viene aggiunto al carrello                |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la lista dei prodotti |
|       2        | Il sistema restituisce la lista dei prodotti |
|       3        | L'utente seleziona il prodotto a cui è interessato |
|       4        | Il sistema presenta la pagina con le info relative al prodotto |
|       5        | L'utente richiede l'aggiunta del prodotto al proprio carrello |
|       6        | Il sistema aggiorna il carrello dell'utente |

#### Scenario 12.2

|  Scenario 12.2 |  Aggiunta prodotto già in un altro carrello                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la lista dei prodotti |
|       2        | Il sistema restituisce la lista dei prodotti |
|       3        | L'utente seleziona il prodotto a cui è interessato |
|       4        | Il sistema presenta la pagina con le info relative al prodotto |
|       5        | L'utente richiede l'aggiunta del prodotto al proprio carrello |
|       6        | Il sistema restituisce un messaggio di errore |

#### Scenario 12.3

|  Scenario 12.3 |  Aggiunta prodotto già venduto                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Stato del sistema invariato, messaggio di errore                           |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la lista dei prodotti |
|       2        | Il sistema restituisce la lista dei prodotti |
|       3        | L'utente seleziona il prodotto a cui è interessato |
|       4        | Il sistema presenta la pagina con le info relative al prodotto |
|       5        | L'utente richiede l'aggiunta del prodotto al proprio carrello |
|       6        | Il sistema restituisce un messaggio di errore |


### Pagamento del carrello corrente, UC13
|  Cliente, Servizio di Pagamento  |           |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Utente: si autentica come cliente |
|  Post condition  | Sistema: imposta la data di pagamento  |
| Nominal Scenario | 13.1 |
|     Variants     | 13.2 13.5 13.6 |
|    Exceptions    | 13.3 13.4 13.7 |


#### Scenario 13.1


|  Scenario 13.1 |  Pagamento del carrello corrente (negozio)  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Data di pagamento del carrello impostata alla data corrente |
|   **Step#**    |                              **Description**                               |
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona ritiro e pagamento in negozio |
|       5        | Utente: conferma l'acquisto dei prodotti |
|       6        | Sistema: imposta la data di pagamento, svuota il carrello e restituisce messaggio di conferma|


#### Scenario 13.2


|  Scenario 13.2 |  Pagamento online del carrello corrente (esito positivo)  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition |  Data di pagamento del carrello impostata alla data corrente  |
|   **Step#**    |                              **Description**                               |
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona il servizio di spedizione    |
|       5        | Utente: procede con il pagamento online con PayPal    |
|       6        | Sistema: richiama il sito PayPal per l'inserimento dati della carta |
|       7        | Utente: conferma l'acquisto dei prodotti |
|       8        | Servizio di pagamento: gestisce il pagamento |
|       9        | Servizio di pagamento: ritorna l'esito positivo del pagamento al sistema|
|       10       | Sistema: imposta la data di pagamento, svuota il carrello e restituisce messaggio di conferma |


#### Scenario 13.3


|  Scenario 13.3 |  Pagamento online del carrello corrente (esito negativo)  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Stato del sistema invariato, messaggio di errore  |
|   **Step#**    |                              **Description**       
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona il servizio di spedizione    |
|       5        | Utente: procede con il pagamento online con PayPal    |
|       6        | Sistema: richiama il sito PayPal per l'inserimento dati della carta |
|       7        | Utente: conferma l'acquisto dei prodotti |
|       8        | Servizio di pagamento: gestisce il pagamento |
|       9        | Servizio di pagamento: ritorna l'esito negativo del pagamento al sistema|
|       10       | Sistema: stato invariato, messaggio di errore |



#### Scenario 13.4


|  Scenario 13.4 |  Pagamento di un carrello vuoto                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Stato del sistema invariato, messaggio di errore  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione del carrello |
|       2        | Il sistema restituisce la lista dei prodotti nel carrello |
|       3        | L'utente conferma l'acquisto dei prodotti |
|       4        | Il sistema restituisce un messaggio di errore |


#### Scenario 13.5


|  Scenario 13.5 |  Pagamento online del carrello corrente (esito positivo) con coupon valido  |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Data di pagamento del carrello impostata alla data corrente  |
|   **Step#**    |                              **Description**                               |
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona il servizio di spedizione    |
|	 5 	    | Utente: inserisce un codice coupon |
| 	 6 	    | Sistema: calcola e restituisce prezzo scontato totale |
|       7        | Utente: procede con il pagamento online con PayPal    |
|       8        | Sistema: richiama il sito PayPal per l'inserimento dati della carta |
|       9        | Utente: conferma l'acquisto dei prodotti |
|      10        | Servizio di pagamento: gestisce il pagamento |
|       11        | Servizio di pagamento: ritorna l'esito positivo del pagamento al sistema|
|       12        | Sistema: imposta la data di pagamento, svuota il carrello e restituisce messaggio di conferma |






#### Scenario 13.6


|  Scenario 13.6 |  Pagamento online del carrello corrente (esito positivo) e generazione coupon |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente, costo totale dei carrelli passati + costo del carrello attuale >= soglia di generazione coupon |
| Post condition | Data di pagamento del carrello impostata alla data corrente, viene generato un codice coupon  |
|   **Step#**    |                              **Description**                               |
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona il servizio di spedizione    |
|       5        | Utente: procede con il pagamento online con PayPal    |
|       6        | Sistema: richiama il sito PayPal per l'inserimento dati della carta |
|       7        | Utente: conferma l'acquisto dei prodotti |
|       8        | Servizio di pagamento: gestisce il pagamento |
|       9        | Servizio di pagamento: ritorna l'esito positivo del pagamento al sistema |
|       10        |Sistema: imposta la data di pagamento, genera un codice coupon, lo mostra all'utente, svuota il carrello corrente e restituisce messaggio di conferma |
       




#### Scenario 13.7


|  Scenario 13.7 |  Pagamento online del carrello corrente (esito positivo) con coupon non valido   |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente  |
| Post condition | Data di pagamento del carrello impostata alla data corrente  |
|   **Step#**    |                              **Description**                               |
|       1        | Utente: richiede la visualizzazione del carrello corrente |
|       2        | Sistema: restituisce la lista dei prodotti nel carrello   |
|       3        | Sistema: calcola il costo totale del carrello |
|       4        | Utente: seleziona il servizio di spedizione    |
|	 5 	    | Utente: inserisce un codice coupon non valido |
|  6      | Sistema: restituisce un messaggio di errore |
|       7        | Utente: procede con il pagamento online con PayPal    |
|       8        | Sistema: richiama il sito PayPal per l'inserimento dati della carta |
|       9        | Utente: conferma l'acquisto dei prodotti |
|      10        | Servizio di pagamento: gestisce il pagamento |
|       11        | Servizio di pagamento: ritorna l'esito positivo del pagamento al sistema|
|       12        | Sistema: imposta la data di pagamento, svuota il carrello e restituisce messaggio di conferma |





### Cronologia carrelli passati, UC14

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | Mostra la lista dei carrelli passati per cui si è effettuato il pagamento |
| Nominal Scenario | 14.1 | 
|     Variants     | -                                               |
|    Exceptions    | -                                               |

#### Scenario 14.1

|  Scenario 14.1 |  Visualizzazione cronologia carrelli passati                         |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Mostra la lista dei carrelli passati per cui si è effettuato il pagamento  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione della cronologia dei carrelli |
|       2        | Il sistema restituisce la lista dei carrelli passati |

### Rimozione prodotto da carrello, UC15

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | Il prodotto selezionato è rimosso dal carrello dell'utente |
| Nominal Scenario | 15.1 | 
|     Variants     | -                                               |
|    Exceptions    | - |

#### Scenario 15.1

|  Scenario 15.1 |  Rimozione prodotto da carrello                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Il prodotto selezionato è rimosso dal carrello dell'utente  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione del proprio carrello |
|       2        | Il sistema restituisce i prodotti attualmente nel suo carrello |
|       3        | L'utente richiede la rimozione di un prodotto |
|       4        | Il sistema rimuove il prodotto dal carrello |


### Cancellazione del carrello, UC16

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | Il carrello dell'utente autenticato è cancellato |
| Nominal Scenario | 16.1 | 
|     Variants     | -                                               |
|    Exceptions    | -      |

#### Scenario 16.1

|  Scenario 16.1 |  Cancellazione del carrello                              |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Il carrello dell'utente autenticato è cancellato  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione del proprio carrello |
|       2        | Il sistema restituisce i prodotti attualmente nel suo carrello |
|       3        | L'utente richiede la cancellazione del proprio carrello |
|       4        | Il sistema cancella il carrello dell'utente |

### Visualizzazione informazioni personali, UC17

| Cliente, Manager |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato                |
|  Post condition  | L'utente visualizza le sue informazioni personali |
| Nominal Scenario | 17.1 | 
|     Variants     | -                                               |
|    Exceptions    | -      |

#### Scenario 17.1

|  Scenario 17.1 | Visualizzazione informazioni personali                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato |
| Post condition | L'utente visualizza le sue informazioni personali  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la schermata principale del servizio |
|       2        | Il sistema restituisce la schermata |
|       3        | L'utente richiede le informazioni personali |
|       4        | Il sistema restituisce un messaggio contenente le informazioni personali |

### Inserimento indirizzo di spedizione, UC18

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | L'utente ha inserito l'indirizzo di spedizione desiderato |
| Nominal Scenario | 18.1 | 
|     Variants     | -                                               |
|    Exceptions    | 18.2    |

#### Scenario 18.1

|  Scenario 18.1 |  Inserimento indirizzo                               |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | L'utente ha inserito l'indirizzo di spedizione desiderato  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona il servizio di spedizione |
|       2        | Il sistema richiede all'utente di inserire l'indirizzo di spedizione  |
|       3        | L'utente inserisce l'indirizzo desiderato |
|       4        | Il sistema conferma inserimento indirizzo |

#### Scenario 18.2

|  Scenario 18.2 |  Inserimento indirizzo errato                     |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | Stato del sistema invariato, messaggio di errore  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente seleziona il servizio di spedizione |
|       2        | Il sistema richiede all'utente di inserire l'indirizzo di spedizione  |
|       3        | L'utente inserisce un indirizzo errato |
| 4              | Stato del sistema invariato, messaggio di errore   |

### Visualizzazione stato dell'ordine, UC19

| Cliente |                                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente è autenticato come cliente                            |
|  Post condition  | L'utente visualizza lo stato dell'ordine |
| Nominal Scenario | 19.1 | 
|     Variants     |      |
|    Exceptions    |      |

#### Scenario 19.1

|  Scenario 19.1 |  Visualizzazione stato dell'ordine
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è autenticato come cliente |
| Post condition | L'utente visualizza lo stato dell'ordine  |
|   **Step#**    |                              **Description**                               |
|       1        | L'utente richiede la visualizzazione della cronologia dei carrelli  |
|       2        | Il sistema fornisce all'utente lo stato dell'ordine per ogni acquisto effettuato con spedizione |

# Glossary


![Uml_class_diagram](/assets/class_diagram_v2.png)


# Deployment Diagram

![deployment_diagram](/assets/Deployment_v2.png)
<br>Il software è gestito tramite un server web, il quale offre le varie funzionalità ai manager (Operazioni manager), ai clienti (Operazioni cliente), agli admin (Operazioni admin) e a chi non è autenticato (Operazioni generali).
<br>Per utilizzare l'applicazione si usa un PC desktop o laptop che ha installato almeno un browser tra quelli previsti in NFR7, in modo da comunicare con il server di cui sopra.
<br>Per non permettere la registrazione di un account admin a qualsiasi utente, l'unico modo per accedere alla pagina corrispondente è tramite PC connesso a rete aziendale (intranet nel deployment diagram).
<br>Infine il server web si appoggia via internet ai server delle compagnie esterne a EzElectronics per gestire pagamenti e spedizioni.
