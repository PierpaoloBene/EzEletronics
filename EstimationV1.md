# Project Estimation - CURRENT
Date:
03/05/2024

Version:
1.0

# Estimation approach
Consider the EZElectronics  project in CURRENT version (as given by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |  26              |             
|  A = Estimated average size per class, in LOC       |   100 LOC                    | 
| S = Estimated size of project, in LOC (= NC * A) | 2600 LOC |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |           260 PH                     |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 7800€ | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |    1,62 settimane          |               

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|requirement document    | 50 PH |
| GUI prototype | 14 PH |
|design document | 15 PH|
|code | 104 PH |
| unit tests | 130 PH |
| api tests | 26 PH |
| management documents  | 5 PH |



# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| **Pianificazione requisiti** | |
| Stima del rischio | 10 PH|
| Studio dei sistemi già esistenti | 32 PH |
| Identificare requisiti funzionali e non funzionali| 16 PH |
| **Design del sistema** | |
| Design delle classi | 50 PH |
| Deployment diagram | 2 PH|
| GUI | 14 PH |
| **Sviluppo** | |
| Sviluppo classi | 64 PH |
| Sviluppo metodi database | 8 PH |
| Sviluppo API | 12 PH |
| Revisione ed aggiornamento documentazione | 12 PH |
|**Testing** ||
| Unit tests | 130 PH|
| API tests | 26 PH |
| Test requisiti non funzionali | 80 PH |
|**Deployment**||
| Distribuzione del software | 12 PH |


###
![Gantt_v1](/assets/Gantt_v1.jpg)

# Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size | 260 PH | 1,62 settimane
| estimate by product decomposition | 344 PH | 2,15 settimane
| estimate by activity decomposition | 468 PH | 2,9 settimane|


Le stime ottenute con il metodo by size non tengono conto delle ore investite sulla parte di design dei requisiti, ma esso è più dettagliato per quanto riguarda la stima della quantità di codice scritto. Complessivamente, dunque, l’effort ottenuto dal metodo by size risulta il minore.
Le stime ottenute con il metodo by product decomposition sono inferiori a quelle ottenute con il metodo by activity perché gli obiettivi del metodo by product decomposition sono finalizzati all’ottenimento di un prodotto, mentre il metodo activity decomposition è più dettagliato per quanto riguarda lo scheduling delle attività e, inoltre, tiene conto della fase di rilascio del software, successiva allo sviluppo.

