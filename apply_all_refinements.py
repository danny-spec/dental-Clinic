import re
import sys

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# -------------------------------------------------------------
# 1. HEADER TEXT CLEANUP
# Remove breadcrumb: "PHILIPPINE FINANCIAL RECONCILIATION · GCASH · MAYA · BIR RECEIPTS"
# -------------------------------------------------------------
old_header_pat = r'<!-- Header -->\s*<div class="border-b border-slate-200 pb-5">\s*<div class="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">.*?</div>\s*<h2 class="text-2xl font-bold text-slate-900 tracking-tight">Cashless Billing & Revenue Analytics</h2>\s*<p class="text-xs text-slate-500 mt-0\.5">Interactive payment reconciliation, date-range trend modeling, and chairside supplies cost correlation\.</p>\s*</div>'
new_header = """<!-- Header -->
        <div class="border-b border-slate-200 pb-5">
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Cashless Billing & Revenue Analytics</h2>
          <p class="text-xs text-slate-500 mt-0.5">Interactive payment reconciliation, date-range trend modeling, and chairside supplies cost correlation.</p>
        </div>"""
text, c1 = re.subn(old_header_pat, new_header, text, count=1, flags=re.DOTALL)
print("1. Header cleaned:", c1)
assert c1 == 1, "Failed to clean header"

# -------------------------------------------------------------
# 2. UPDATE BILLING CALCULATIONS: CASH VS DIGITAL & SETTLED LOGIC
# -------------------------------------------------------------
old_calc_pat = r'// 1\. Filter Invoices & Usage based on date range.*?const totalConsumablesCount = filteredUsage\.length;\n'
new_calc = """// 1. Filter Invoices & Usage based on date range
      const filteredInvoices = MOCK_INVOICES.filter(inv => inv.date >= billingStartDate && inv.date <= billingEndDate);
      const settledInvoices = filteredInvoices.filter(inv => 
        inv.paymentStatus === 'Settled' || 
        inv.paymentStatus === 'Verified & Settled' || 
        inv.paymentStatus === 'Cash Received'
      );
      const pendingInvoices = filteredInvoices.filter(inv => 
        inv.paymentStatus === 'Pending' || 
        inv.paymentStatus === 'Unpaid / Pending Verification'
      );

      const totalRevenue = settledInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

      // Cash vs Digital Payment Breakdown
      const cashInvoices = settledInvoices.filter(inv => inv.gateway === 'Cash' || inv.paymentStatus === 'Cash Received');
      const digitalInvoices = settledInvoices.filter(inv => inv.gateway !== 'Cash' && inv.paymentStatus !== 'Cash Received');

      const cashRevenue = cashInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const digitalRevenue = digitalInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalBreakdownRevenue = cashRevenue + digitalRevenue;

      const cashPercent = totalBreakdownRevenue > 0 ? Math.round((cashRevenue / totalBreakdownRevenue) * 100) : 0;
      const digitalPercent = totalBreakdownRevenue > 0 ? (100 - cashPercent) : 0;

      // Consumables in date range
      const filteredUsage = MOCK_USAGE_LOGS.filter(u => u.date >= billingStartDate && u.date <= billingEndDate);
      const totalConsumablesCount = filteredUsage.length;
"""
text, c2 = re.subn(old_calc_pat, new_calc, text, count=1, flags=re.DOTALL)
print("2. Calculations updated:", c2)
assert c2 == 1, "Failed to update calculations"

# -------------------------------------------------------------
# 3. MODERN "PAYMENT BREAKDOWN" CARD
# Title: "Payment Breakdown"
# Metrics: Cash: 45% · ₱14,760 | Digital: 55% · ₱18,040
# Dual-color progress bar showing Cash (emerald green) vs Digital (teal/blue)
# -------------------------------------------------------------
old_card_pat = r'<!-- Cashless Gateway Share -->\s*<div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">.*?</div>\s*</div>\s*</div>'
new_card = """<!-- Payment Breakdown -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500 font-medium">Payment Breakdown</span>
              <span class="text-[10px] font-mono text-slate-400">Cash vs. Digital</span>
            </div>
            <div class="text-xs font-semibold text-slate-800 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span class="text-emerald-700 font-bold">Cash: ${cashPercent}% · ₱${cashRevenue.toLocaleString()}</span>
              <span class="text-slate-300">|</span>
              <span class="text-teal-700 font-bold">Digital: ${digitalPercent}% · ₱${digitalRevenue.toLocaleString()}</span>
            </div>
            <!-- Dual-color progress bar showing Cash (emerald green) vs Digital (teal/blue) -->
            <div class="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden flex shadow-inner">
              <div class="bg-emerald-500 h-full transition-all duration-300" style="width: ${cashPercent}%" title="Cash: ${cashPercent}%"></div>
              <div class="bg-teal-600 h-full transition-all duration-300" style="width: ${digitalPercent}%" title="Digital: ${digitalPercent}%"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Clinic Counter</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-teal-600 inline-block"></span> GCash / Maya</span>
            </div>
          </div>"""
text, c3 = re.subn(old_card_pat, new_card, text, count=1, flags=re.DOTALL)
print("3. Payment breakdown card updated:", c3)
assert c3 == 1, "Failed to update payment breakdown card"

# -------------------------------------------------------------
# 4. BILLING LEDGER TABLE: THEAD WITH PAYMENT STATUS & ACTIONS
# -------------------------------------------------------------
old_th_pat = r'<thead class="bg-slate-50 text-\[11px\] text-slate-500 uppercase border-b border-slate-200 tracking-wider">\s*<tr>\s*<th class="p-4">Invoice #</th>\s*<th class="p-4">Date</th>\s*<th class="p-4">Patient</th>\s*<th class="p-4">Procedure</th>\s*<th class="p-4">Gateway & Reference</th>\s*<th class="p-4">Status</th>\s*<th class="p-4 text-right">Total \(₱\)</th>\s*</tr>\s*</thead>'
new_th = """<thead class="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200 tracking-wider">
                      <tr>
                        <th class="p-4">Invoice #</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Patient</th>
                        <th class="p-4">Procedure</th>
                        <th class="p-4">Gateway & Reference</th>
                        <th class="p-4">Payment Status</th>
                        <th class="p-4 text-right">Total (₱)</th>
                        <th class="p-4 text-right">Actions</th>
                      </tr>
                    </thead>"""
text, c4 = re.subn(old_th_pat, new_th, text, count=1, flags=re.DOTALL)
print("4. Thead updated:", c4)
assert c4 == 1, "Failed to update billing thead"

# -------------------------------------------------------------
# 5. BILLING LEDGER TABLE: TBODY ROWS WITH VERIFY & VIEW RECEIPT
# -------------------------------------------------------------
old_rows_pat = r'\$\{filteredInvoices\.map\(inv => `\s*<tr class="hover:bg-slate-50/70 transition-colors">.*?</tr>\s*`\)\.join\(\x27\x27\)\}'
new_rows = """${filteredInvoices.map(inv => {
                        const isSettled = inv.paymentStatus === 'Verified & Settled' || inv.paymentStatus === 'Settled';
                        const isCash = inv.paymentStatus === 'Cash Received';
                        const isPending = !isSettled && !isCash;

                        return `
                        <tr class="hover:bg-slate-50/70 transition-colors">
                          <td class="p-4 font-mono font-bold text-slate-800">${inv.invoiceNumber}</td>
                          <td class="p-4 font-mono text-slate-600">${inv.date}</td>
                          <td class="p-4 font-semibold text-slate-900">${inv.patientName}</td>
                          <td class="p-4 text-slate-700">${inv.procedure}</td>
                          <td class="p-4">
                            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              inv.gateway === 'GCash' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                              inv.gateway === 'Maya' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                              'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }">
                              ${inv.gateway === 'Cash' ? '💵' : inv.gateway === 'GCash' ? '📱' : '💳'} ${inv.gateway} · ${inv.refNumber}
                            </span>
                          </td>
                          <td class="p-4">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              isCash ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }">
                              ${isSettled ? '✓' : isCash ? '💵' : '⏳'}
                              ${inv.paymentStatus || 'Unpaid / Pending Verification'}
                            </span>
                          </td>
                          <td class="p-4 text-right font-mono font-bold text-teal-800">
                            ₱${inv.totalAmount.toLocaleString()}
                          </td>
                          <td class="p-4 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              ${isPending ? `
                                <button 
                                  onclick="verifyBillingPayment('${inv.id}')"
                                  class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Verify Payment (Cash or Digital Reference)"
                                >
                                  <span>✓</span>
                                  <span>Verify Payment</span>
                                </button>
                              ` : ''}
                              <button 
                                onclick="openDigitalReceiptModal('${inv.id}')"
                                class="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 rounded text-xs font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-teal-300 flex items-center gap-1"
                                title="View Digital Receipt"
                              >
                                <span>📄</span>
                                <span>View Digital Receipt</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                      }).join('')}"""
text, c5 = re.subn(old_rows_pat, new_rows, text, count=1, flags=re.DOTALL)
print("5. Table rows updated:", c5)
assert c5 == 1, "Failed to update table rows"

# -------------------------------------------------------------
# 6. PATIENTS DOSSIER SEARCH & EXPANDABLE PROFILE MODAL
# -------------------------------------------------------------
old_dossier_pat = r'function renderPatientsDossierView\(\)\s*\{.*?document\.getElementById\(\x27view-patients-dossier\x27\)\.innerHTML = html;\s*\}'
new_dossier = """function renderPatientsDossierView() {
      const q = (patientDossierSearchQuery || '').toLowerCase().trim();
      const filteredPatients = PATIENTS.filter(p => {
        if (!q) return true;
        const nameMatch = (p.fullName || '').toLowerCase().includes(q);
        const idMatch = (p.id || '').toLowerCase().includes(q);
        const phoneMatch = (p.phone || '').replace(/\\D/g, '').includes(q.replace(/\\D/g, '')) || (p.phone || '').toLowerCase().includes(q);
        return nameMatch || idMatch || phoneMatch;
      });

      const html = `
        <div class="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Electronic Dental Records</span>
              <span class="text-slate-300">·</span>
              <span class="text-slate-500 font-normal">Santiago City, Isabela</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Centralized Patient Medical Dossiers</h2>
            <p class="text-xs text-slate-500 mt-0.5">Complete dental procedure records, clinical odontogram history, drug allergies, and payment logs.</p>
          </div>
          <div class="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-center">
            Showing <strong class="text-teal-800">${filteredPatients.length}</strong> of ${PATIENTS.length} Registered Patients
          </div>
        </div>

        <!-- Real-Time Search Toolbar -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input 
              type="text" 
              id="patientDossierSearchInput"
              value="${patientDossierSearchQuery}"
              oninput="handlePatientDossierSearch(this.value)"
              placeholder="Search by patient name, ID, or contact number..."
              class="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:bg-white transition-all"
            />
            ${patientDossierSearchQuery ? `
              <button 
                onclick="handlePatientDossierSearch('')" 
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                title="Clear Search"
              >
                ✕
              </button>
            ` : ''}
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200 tracking-wider">
              <tr>
                <th class="p-4">ID</th>
                <th class="p-4">Patient Full Name</th>
                <th class="p-4">Contact</th>
                <th class="p-4">Allergies</th>
                <th class="p-4">Last Visit</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredPatients.length === 0 ? `
                <tr>
                  <td colspan="6" class="p-12 text-center text-slate-400">
                    <p class="text-sm font-semibold text-slate-600">No patient records found</p>
                    <p class="text-xs text-slate-400 mt-1">No matches for "${patientDossierSearchQuery}". Try another name, ID, or mobile number.</p>
                  </td>
                </tr>
              ` : filteredPatients.map(p => `
                <tr class="hover:bg-teal-50/30 transition-colors group">
                  <td class="p-4 font-mono font-bold text-teal-800">${p.id}</td>
                  <td class="p-4 font-semibold">
                    <button 
                      type="button" 
                      onclick="openPatientHistoryModal('${p.id}')"
                      class="text-teal-700 hover:text-teal-900 font-bold hover:underline transition-colors text-left cursor-pointer flex items-center gap-1.5"
                    >
                      <span>${p.fullName}</span>
                      <span class="text-slate-400 font-normal text-[11px]">(${p.age} ${p.gender})</span>
                    </button>
                  </td>
                  <td class="p-4 font-mono text-slate-600">${p.phone}</td>
                  <td class="p-4">
                    ${(p.allergies && p.allergies.length > 0 && !p.allergies.includes('No Known Drug Allergies (NKDA)')) ? `
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                        <span>⚠️</span> ${p.allergies.join(', ')}
                      </span>
                    ` : `
                      <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        NKDA (None)
                      </span>
                    `}
                  </td>
                  <td class="p-4 font-mono text-slate-600">${p.lastVisit || 'None'}</td>
                  <td class="p-4 text-right">
                    <button 
                      onclick="openPatientHistoryModal('${p.id}')"
                      class="px-3 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer border border-slate-200 hover:border-teal-600 shadow-2xs"
                    >
                      View Dental Record
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('view-patients-dossier').innerHTML = html;
    }"""
text, c6 = re.subn(old_dossier_pat, lambda m: new_dossier, text, count=1, flags=re.DOTALL)
print("6. Dossier view updated:", c6)
assert c6 == 1, "Failed to update dossier view"

# -------------------------------------------------------------
# 7. INJECT CONTROLLER FUNCTIONS & GLOBAL VARIABLES
# (handlePatientDossierSearch, openPatientHistoryModal, switchPatientModalTab,
#  closePatientHistoryModal, openDigitalReceiptModal, closeDigitalReceiptModal,
#  verifyBillingPayment, verifyQueuePayment, openReceiptForQueuePatient)
# -------------------------------------------------------------
controller_code = """
    // --- PATIENTS DOSSIER SEARCH & EXPANDABLE PROFILE MODAL CONTROLLERS ---
    let patientDossierSearchQuery = '';
    let currentDossierModalPatientId = null;
    let currentDossierModalTab = 'treatment'; // 'treatment' or 'payment'

    function handlePatientDossierSearch(val) {
      patientDossierSearchQuery = val || '';
      renderPatientsDossierView();
      // Keep focus on the search input
      setTimeout(() => {
        const input = document.getElementById('patientDossierSearchInput');
        if (input) {
          input.focus();
          const len = input.value.length;
          input.setSelectionRange(len, len);
        }
      }, 10);
    }

    function openPatientHistoryModal(patientId) {
      const patient = PATIENTS.find(p => p.id === patientId || p.fullName.toLowerCase() === (patientId || '').toLowerCase());
      if (!patient) {
        showToast('Patient record not found.');
        return;
      }
      currentDossierModalPatientId = patient.id;
      currentDossierModalTab = 'treatment';

      // Header demographics
      const avatarEl = document.getElementById('patientModalAvatar');
      if (avatarEl) {
        avatarEl.textContent = patient.fullName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('');
      }

      const nameEl = document.getElementById('patientModalFullName');
      if (nameEl) nameEl.textContent = patient.fullName;

      const idBadge = document.getElementById('patientModalIdBadge');
      if (idBadge) idBadge.textContent = patient.id;

      const allergiesBadge = document.getElementById('patientModalAllergiesBadge');
      if (allergiesBadge) {
        const hasAllergies = patient.allergies && patient.allergies.length > 0 && !patient.allergies.includes('No Known Drug Allergies (NKDA)');
        allergiesBadge.innerHTML = hasAllergies 
          ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">⚠️ ${patient.allergies.join(', ')}</span>`
          : `<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NKDA (No Drug Allergies)</span>`;
      }

      const demoEl = document.getElementById('patientModalDemographics');
      if (demoEl) demoEl.textContent = `${patient.age || 28} years old · ${patient.gender || 'Patient'}`;

      const phoneEl = document.getElementById('patientModalPhone');
      if (phoneEl) phoneEl.textContent = patient.phone || 'No phone recorded';

      const addrEl = document.getElementById('patientModalAddress');
      if (addrEl) addrEl.textContent = patient.address || 'Santiago City, Isabela';

      renderPatientModalTabContent();

      const modal = document.getElementById('patientHistoryModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closePatientHistoryModal() {
      currentDossierModalPatientId = null;
      const modal = document.getElementById('patientHistoryModal');
      if (modal) modal.classList.add('hidden');
    }

    function switchPatientModalTab(tab) {
      currentDossierModalTab = tab;
      const btnTreatment = document.getElementById('patientTabBtnTreatment');
      const btnPayment = document.getElementById('patientTabBtnPayment');

      if (btnTreatment && btnPayment) {
        if (tab === 'treatment') {
          btnTreatment.className = "flex items-center gap-2 px-4 py-2.5 border-b-2 border-teal-600 text-teal-900 font-bold bg-white rounded-t-lg transition-all cursor-pointer shadow-2xs";
          btnPayment.className = "flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-all cursor-pointer";
        } else {
          btnPayment.className = "flex items-center gap-2 px-4 py-2.5 border-b-2 border-teal-600 text-teal-900 font-bold bg-white rounded-t-lg transition-all cursor-pointer shadow-2xs";
          btnTreatment.className = "flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-all cursor-pointer";
        }
      }

      renderPatientModalTabContent();
    }

    function renderPatientModalTabContent() {
      const container = document.getElementById('patientModalTabContent');
      if (!container || !currentDossierModalPatientId) return;

      const patient = PATIENTS.find(p => p.id === currentDossierModalPatientId);
      if (!patient) return;

      if (currentDossierModalTab === 'treatment') {
        const treatments = patient.treatmentHistory || [];
        const toothNotes = patient.teeth ? Object.entries(patient.teeth).map(([num, data]) => ({
          tooth: num,
          condition: data.condition,
          notes: data.notes,
          dateTreated: data.dateTreated || patient.lastVisit
        })) : [];

        let html = `
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <span>🦷 Treatment & Clinical Procedure Records</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">${treatments.length} Procedures</span>
              </h4>
              <span class="text-[11px] text-slate-400">Attending Dental Staff · Odontogram Records</span>
            </div>
        `;

        if (treatments.length === 0 && toothNotes.length === 0) {
          html += `
            <div class="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              <p>No historical treatments recorded yet for this patient.</p>
            </div>
          `;
        } else {
          html += `<div class="space-y-3">`;
          treatments.forEach(t => {
            html += `
              <div class="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-teal-300 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                    <strong class="text-slate-900 font-bold text-xs sm:text-sm">${t.procedure}</strong>
                  </div>
                  <span class="font-mono text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-center">${t.date}</span>
                </div>
                <div class="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                  <span>Attending Dentist:</span>
                  <strong class="text-teal-900">${t.dentist || 'Dr. Maria Corazon Santos, DMD'}</strong>
                </div>
                <div class="p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed font-sans">
                  <span class="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">Clinical & Odontogram Notes:</span>
                  ${t.notes || 'Routine procedure executed under sterile chairside protocol. Tooth margin sealed and inspected.'}
                </div>
              </div>
            `;
          });

          if (toothNotes.length > 0) {
            html += `
              <div class="pt-2">
                <h5 class="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Detailed Odontogram Tooth Map Findings:</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  ${toothNotes.map(tn => `
                    <div class="p-3 bg-white border border-slate-200 rounded-lg text-[11px]">
                      <div class="flex items-center justify-between font-bold text-slate-800">
                        <span>Tooth #${tn.tooth} (${TOOTH_NAMES[tn.tooth] || 'Tooth'})</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          tn.condition === 'caries' ? 'bg-rose-100 text-rose-800' :
                          tn.condition === 'filled' ? 'bg-emerald-100 text-emerald-800' :
                          tn.condition === 'crown' ? 'bg-purple-100 text-purple-800' :
                          tn.condition === 'root_canal' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }">${tn.condition}</span>
                      </div>
                      <p class="text-slate-600 mt-1">${tn.notes}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }

          html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
      } else {
        // PAYMENT & INVOICING HISTORY TAB
        const pInvoices = MOCK_INVOICES.filter(inv => 
          inv.patientName.toLowerCase().trim() === patient.fullName.toLowerCase().trim()
        );

        let totalBilled = pInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        let totalSettled = pInvoices.filter(inv => 
          inv.paymentStatus === 'Settled' || inv.paymentStatus === 'Verified & Settled' || inv.paymentStatus === 'Cash Received'
        ).reduce((sum, inv) => sum + inv.totalAmount, 0);

        let html = `
          <div class="space-y-4">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Itemized Visits</span>
                <div class="font-bold text-slate-800 text-sm">${pInvoices.length} Invoices Recorded</div>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Amount Settled</span>
                <div class="font-bold font-mono text-emerald-700 text-sm">₱${totalSettled.toLocaleString()}</div>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Billed Lifetime</span>
                <div class="font-bold font-mono text-teal-800 text-sm">₱${totalBilled.toLocaleString()}</div>
              </div>
            </div>
        `;

        if (pInvoices.length === 0) {
          html += `
            <div class="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              <p>No billing or invoicing records found for this patient.</p>
            </div>
          `;
        } else {
          html += `
            <div class="overflow-x-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th class="p-3">Invoice #</th>
                    <th class="p-3">Visit Date</th>
                    <th class="p-3">Procedure</th>
                    <th class="p-3">Payment Method & Ref</th>
                    <th class="p-3">Status</th>
                    <th class="p-3 text-right">Amount</th>
                    <th class="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${pInvoices.map(inv => {
                    const isSettled = inv.paymentStatus === 'Verified & Settled' || inv.paymentStatus === 'Settled';
                    const isCash = inv.paymentStatus === 'Cash Received';
                    const isPending = !isSettled && !isCash;

                    return `
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono font-bold text-slate-800">${inv.invoiceNumber}</td>
                      <td class="p-3 font-mono text-slate-600">${inv.date}</td>
                      <td class="p-3 font-medium text-slate-900">${inv.procedure}</td>
                      <td class="p-3">
                        <span class="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          inv.gateway === 'Cash' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          inv.gateway === 'GCash' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                          'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        }">
                          ${inv.gateway === 'Cash' ? '💵' : inv.gateway === 'GCash' ? '📱' : '💳'} ${inv.gateway} · ${inv.refNumber}
                        </span>
                      </td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSettled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isCash ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }">
                          ${inv.paymentStatus || 'Unpaid / Pending Verification'}
                        </span>
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-teal-800">
                        ₱${inv.totalAmount.toLocaleString()}
                      </td>
                      <td class="p-3 text-right">
                        <button 
                          onclick="openDigitalReceiptModal('${inv.id}')"
                          class="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 rounded text-xs font-semibold border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }

        html += `</div>`;
        container.innerHTML = html;
      }
    }

    // --- DIGITAL RECEIPT & PAYMENT VERIFICATION CONTROLLERS ---
    function verifyBillingPayment(invoiceId) {
      const inv = MOCK_INVOICES.find(i => i.id === invoiceId);
      if (!inv) return;

      if (inv.gateway === 'Cash') {
        inv.paymentStatus = 'Cash Received';
      } else {
        inv.paymentStatus = 'Verified & Settled';
      }

      // Synchronize associated appointments if any
      MOCK_APPOINTMENTS.forEach(a => {
        if (a.patientName.toLowerCase().trim() === inv.patientName.toLowerCase().trim() && a.procedureType === inv.procedure) {
          a.paymentStatus = inv.paymentStatus;
        }
      });

      // Synchronize clinic queue if any
      CLINIC_QUEUE.forEach(q => {
        if (q.patientName.toLowerCase().trim() === inv.patientName.toLowerCase().trim()) {
          q.paymentStatus = inv.paymentStatus;
        }
      });

      showToast(`Payment VERIFIED for Invoice ${inv.invoiceNumber} (${inv.patientName})! Revenue updated.`);
      renderBillingView();
      if (document.getElementById('view-overview') && !document.getElementById('view-overview').classList.contains('hidden')) {
        renderOverviewView();
      }
    }

    function verifyQueuePayment(ticket) {
      const item = CLINIC_QUEUE.find(q => q.ticket === ticket);
      if (!item) return;

      const isCash = item.gateway === 'Cash';
      item.paymentStatus = isCash ? 'Cash Received' : 'Verified & Settled';

      // Find and update matching invoice
      const matchingInv = MOCK_INVOICES.find(i => 
        i.patientName.toLowerCase().trim() === item.patientName.toLowerCase().trim() &&
        (i.procedure === item.procedure || i.date === '2026-10-06')
      );
      if (matchingInv) {
        matchingInv.paymentStatus = item.paymentStatus;
      }

      showToast(`✓ Ticket ${ticket} (${item.patientName}) payment verified and settled.`);
      renderOverviewView();
      if (document.getElementById('view-billing') && !document.getElementById('view-billing').classList.contains('hidden')) {
        renderBillingView();
      }
    }

    function openReceiptForQueuePatient(patientName) {
      let inv = MOCK_INVOICES.find(i => i.patientName.toLowerCase().trim() === patientName.toLowerCase().trim());
      if (inv) {
        openDigitalReceiptModal(inv.id);
      } else {
        const queueItem = CLINIC_QUEUE.find(q => q.patientName.toLowerCase().trim() === patientName.toLowerCase().trim());
        const tempInvId = `inv-q-${Date.now()}`;
        const generatedInv = {
          id: tempInvId,
          invoiceNumber: `TC-OR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: patientName,
          procedure: queueItem ? queueItem.procedure : "Chairside Dental Procedure",
          date: "2026-10-06",
          gateway: queueItem ? queueItem.gateway : "Cash",
          dentistName: "Dr. Maria Corazon Santos, DMD",
          refNumber: queueItem ? (queueItem.gateway === 'Cash' ? 'Clinic Counter' : 'Online Verification') : 'Ref-Counter',
          totalAmount: queueItem ? queueItem.fee : 1500,
          paymentStatus: queueItem ? queueItem.paymentStatus : "Cash Received"
        };
        MOCK_INVOICES.unshift(generatedInv);
        openDigitalReceiptModal(tempInvId);
      }
    }

    function openDigitalReceiptModal(invoiceId) {
      const inv = MOCK_INVOICES.find(i => i.id === invoiceId);
      if (!inv) {
        showToast('Invoice not found.');
        return;
      }

      const body = document.getElementById('digitalReceiptBody');
      if (!body) return;

      const isSettled = inv.paymentStatus === 'Verified & Settled' || inv.paymentStatus === 'Settled';
      const isCash = inv.paymentStatus === 'Cash Received';
      const isPending = !isSettled && !isCash;

      body.innerHTML = `
        <div class="space-y-4">
          <!-- Clinic Header -->
          <div class="border-b border-slate-200 pb-3 text-center space-y-0.5">
            <h4 class="font-extrabold text-slate-900 text-sm tracking-tight">TEETHCARE DENTAL CLINIC</h4>
            <p class="text-[11px] text-slate-500 font-medium">Bautista-Santos Professional Dental Partners</p>
            <p class="text-[11px] text-teal-800 font-semibold">📍 Maharlika Highway, Santiago City, Isabela, Philippines</p>
            <p class="text-[10px] text-slate-400 font-mono">TIN: 402-918-204-000 · BIR Permit #2026-SNT-0419 · PRC License: 0054219</p>
          </div>

          <!-- Official Electronic Receipt Header -->
          <div class="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <span class="text-slate-400 font-semibold block uppercase text-[10px]">Official Receipt No:</span>
              <strong class="font-mono text-teal-900 text-xs">${inv.invoiceNumber}</strong>
            </div>
            <div class="text-right">
              <span class="text-slate-400 font-semibold block uppercase text-[10px]">Date Issued:</span>
              <span class="font-mono text-slate-700">${inv.date}</span>
            </div>
          </div>

          <!-- Patient & Attending Doctor Info -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200/80">
            <div>
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Patient Name:</span>
              <strong class="text-slate-900 text-xs">${inv.patientName}</strong>
              <p class="text-[10px] text-slate-500 mt-0.5">Clinic Registered Record</p>
            </div>
            <div class="text-right">
              <span class="text-slate-400 text-[10px] uppercase font-bold block">Attending Dentist:</span>
              <strong class="text-teal-900 text-xs">${inv.dentistName || 'Dr. Maria Corazon Santos, DMD'}</strong>
              <p class="text-[10px] text-slate-500 mt-0.5">Dental Surgeon</p>
            </div>
          </div>

          <!-- Itemized Procedure & Billing Breakdown -->
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-[11px] text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th class="p-2.5">Dental Procedure / Description</th>
                  <th class="p-2.5 text-right">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="p-2.5">
                    <strong class="text-slate-800">${inv.procedure}</strong>
                    <div class="text-[11px] text-slate-400">Chairside clinical treatment & materials included</div>
                  </td>
                  <td class="p-2.5 text-right font-mono font-bold text-slate-800">
                    ₱${inv.totalAmount.toLocaleString()}
                  </td>
                </tr>
                <tr class="bg-slate-50/50">
                  <td class="p-2.5 text-slate-500 font-medium">VAT (12% Included)</td>
                  <td class="p-2.5 text-right font-mono text-slate-500">₱${Math.round(inv.totalAmount * 0.12).toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot class="border-t-2 border-slate-200 bg-teal-50/50 font-bold">
                <tr>
                  <td class="p-3 text-xs text-teal-950 font-bold uppercase">Total Settleable Amount:</td>
                  <td class="p-3 text-right text-sm font-mono text-teal-900">₱${inv.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Verification Details & Stamp -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Payment Gateway / Method:</span>
              <span class="font-bold text-slate-800 flex items-center gap-1">
                ${inv.gateway === 'Cash' ? '💵 Clinic Counter Cash' : inv.gateway === 'GCash' ? '📱 GCash Mobile Payment' : '💳 Maya Online Transfer'}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Transaction Reference No:</span>
              <span class="font-mono font-bold text-teal-800">${inv.refNumber}</span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span class="text-slate-500">Payment Status:</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isSettled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                isCash ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                'bg-amber-100 text-amber-800 border border-amber-300'
              }">
                ${isSettled ? '✓ Verified & Settled' : isCash ? '💵 Cash Received' : '⏳ Unpaid / Pending Verification'}
              </span>
            </div>
          </div>

          <!-- Clinic Location & Verification Footer -->
          <div class="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 font-mono">
            <p>Certified Official Electronic Receipt · TeethCare Dental Center</p>
            <p>Santiago City, Isabela · Thank you for trusting your smile with us!</p>
          </div>
        </div>
      `;

      const modal = document.getElementById('digitalReceiptModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeDigitalReceiptModal() {
      const modal = document.getElementById('digitalReceiptModal');
      if (modal) modal.classList.add('hidden');
    }
"""

# Place the controller code before the closing </script> tag
idx = text.rfind("</script>")
assert idx != -1, "Cannot find </script>"
text = text[:idx] + "\n" + controller_code + "\n" + text[idx:]

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("SUCCESS: index.html updated successfully with all Part 1 & Part 2 refinements!")
