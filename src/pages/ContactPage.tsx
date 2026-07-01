import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ContactInfo } from '@/components/pages/contact/ContactInfo'
import { InquiryForm } from '@/components/pages/contact/InquiryForm'

export const ContactPage = () => {
  return (
    <section className="pt-32 pb-40 px-10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeading
            label="Contact"
            title="联系我们"
            description="无论您想咨询定制服务，还是只是聊聊关于水晶的一切，我们都很乐意倾听。"
          />
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-16 mt-20">
          <ContactInfo />
          <InquiryForm />
        </div>
      </div>
    </section>
  )
}
