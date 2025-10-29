import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HelpModalProps = {
  onClose: () => void;
};

export default function HelpModal({ onClose }: HelpModalProps) {
  const faqs = [
    { question: 'How do I track my order?', answer: 'You can track your order in real-time from the Orders screen.' },
    { question: 'What payment methods do you accept?', answer: 'We accept Cash, GCash, and QRPH payment methods.' },
    { question: 'How do I cancel an order?', answer: 'You can cancel orders within 5 minutes of booking.' },
    { question: 'What are your delivery areas?', answer: 'We deliver within Cebu City and nearby municipalities.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.contactBox}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#dc2626" />
              <Text style={styles.contactText}>+63 2 1234 5678</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#dc2626" />
              <Text style={styles.contactText}>support@sugo.com</Text>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, idx) => (
              <View key={idx} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <Ionicons name="help-circle" size={16} color="#dc2626" />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Report Issue */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.reportButton}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.reportText}>Report a Problem</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 13,
    color: '#6b7280',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
  },
  reportText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});
