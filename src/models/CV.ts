export interface CVResult{
    full_name: string
    email: string
    phone_number:string
    linkedin_url:string
    summary:string
    skills:string[]
    work_experience: {
        job_title:string
        company:string
        start_date:string
        end_date:string
        description_points:string[]
    }[]
    education: {
        degree: string
        field_of_study:string
        graduation_year:string
        institution:string
    }[]
}